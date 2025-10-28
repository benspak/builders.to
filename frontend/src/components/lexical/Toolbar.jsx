'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  $insertNodes,
  $createTextNode,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
} from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useEffect, useState } from 'react';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdCode,
} from 'react-icons/md';

export function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
        }
      });
    });
  }, [editor]);

  const formatHeading = (headingSize) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length > 0) {
          const textContent = selection.getTextContent();
          selection.removeText();
          const headingNode = $createHeadingNode(headingSize);
          headingNode.append($createTextNode(textContent));
          $insertNodes([headingNode]);
        }
      }
    });
    setShowFormatMenu(false);
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length > 0) {
          const textContent = selection.getTextContent();
          selection.removeText();
          const paragraphNode = $createParagraphNode();
          paragraphNode.append($createTextNode(textContent));
          $insertNodes([paragraphNode]);
        }
      }
    });
    setShowFormatMenu(false);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length > 0) {
          const textContent = selection.getTextContent();
          selection.removeText();
          const quoteNode = $createQuoteNode();
          quoteNode.append($createTextNode(textContent));
          $insertNodes([quoteNode]);
        }
      }
    });
  };

  const formatCode = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length > 0) {
          const textContent = selection.getTextContent();
          selection.removeText();
          const codeNode = $createCodeNode();
          codeNode.append($createTextNode(textContent));
          $insertNodes([codeNode]);
        }
      }
    });
  };

  const insertList = (type) => {
    if (type === 'ordered') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border-light)',
        padding: '0.5rem',
        backgroundColor: 'var(--bg-secondary-light)',
        display: 'flex',
        gap: '0.25rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-sm"
          onClick={() => setShowFormatMenu(!showFormatMenu)}
        >
          Format
        </button>
        {showFormatMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: 'white',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 10,
              minWidth: '150px',
              marginTop: '0.25rem',
            }}
          >
            <button
              className="btn-link"
              onClick={() => formatParagraph()}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem' }}
            >
              Paragraph
            </button>
            <button
              className="btn-link"
              onClick={() => formatHeading('h1')}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem' }}
            >
              Heading 1
            </button>
            <button
              className="btn-link"
              onClick={() => formatHeading('h2')}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem' }}
            >
              Heading 2
            </button>
            <button
              className="btn-link"
              onClick={() => formatHeading('h3')}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem' }}
            >
              Heading 3
            </button>
            <button
              className="btn-link"
              onClick={() => formatQuote()}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem' }}
            >
              Quote
            </button>
            <button
              className="btn-link"
              onClick={() => formatCode()}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem' }}
            >
              Code Block
            </button>
          </div>
        )}
      </div>

      <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-light)', alignSelf: 'center' }} />

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button
          className={`btn btn-sm ${isBold ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          aria-label="Bold"
        >
          <MdFormatBold />
        </button>
        <button
          className={`btn btn-sm ${isItalic ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          aria-label="Italic"
        >
          <MdFormatItalic />
        </button>
        <button
          className={`btn btn-sm ${isUnderline ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          aria-label="Underline"
        >
          <MdFormatUnderlined />
        </button>
      </div>

      <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-light)', alignSelf: 'center' }} />

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button
          className="btn btn-sm btn-outline"
          onClick={formatQuote}
          aria-label="Quote"
        >
          <MdFormatQuote />
        </button>
        <button
          className="btn btn-sm btn-outline"
          onClick={formatCode}
          aria-label="Code Block"
        >
          <MdCode />
        </button>
      </div>

      <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-light)', alignSelf: 'center' }} />

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button
          className="btn btn-sm btn-outline"
          onClick={() => insertList('unordered')}
          aria-label="Bullet List"
        >
          <MdFormatListBulleted />
        </button>
        <button
          className="btn btn-sm btn-outline"
          onClick={() => insertList('ordered')}
          aria-label="Numbered List"
        >
          <MdFormatListNumbered />
        </button>
      </div>
    </div>
  );
}
