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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const htmlEl = document.documentElement;
      setIsDarkMode(htmlEl.getAttribute('data-theme') === 'dark');
    };

    checkDarkMode();

    const observer = new MutationObserver(() => {
      checkDarkMode();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!showFormatMenu) return;

    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest('[data-format-menu]')) {
        setShowFormatMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFormatMenu]);

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

  const bgColor = isDarkMode ? 'var(--bg-secondary-dark)' : 'white';
  const hoverBgColor = isDarkMode ? 'var(--bg-dark)' : 'var(--bg-secondary-light)';
  const textColor = isDarkMode ? 'var(--text-dark)' : 'var(--text-light)';
  const borderColor = isDarkMode ? 'var(--border-dark)' : 'var(--border-light)';
  const toolbarBg = isDarkMode ? 'var(--bg-secondary-dark)' : 'var(--bg-secondary-light)';

  return (
    <div
      style={{
        borderBottom: `1px solid ${borderColor}`,
        padding: '0.75rem',
        backgroundColor: toolbarBg,
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'relative' }} data-format-menu>
        <button
          onClick={() => setShowFormatMenu(!showFormatMenu)}
          style={{
            padding: '0.5rem 1rem',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: bgColor,
            color: textColor,
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBgColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = bgColor;
          }}
        >
          Format
          <span style={{ fontSize: '0.75rem' }}>▼</span>
        </button>
        {showFormatMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 10,
              minWidth: '150px',
              marginTop: '0.25rem',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => formatParagraph()}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', transition: 'background var(--transition-fast)', color: textColor }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBgColor}
              onMouseLeave={(e) => e.currentTarget.style.background = bgColor}
            >
              Paragraph
            </button>
            <button
              onClick={() => formatHeading('h1')}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', transition: 'background var(--transition-fast)', color: textColor }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBgColor}
              onMouseLeave={(e) => e.currentTarget.style.background = bgColor}
            >
              Heading 1
            </button>
            <button
              onClick={() => formatHeading('h2')}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', transition: 'background var(--transition-fast)', color: textColor }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBgColor}
              onMouseLeave={(e) => e.currentTarget.style.background = bgColor}
            >
              Heading 2
            </button>
            <button
              onClick={() => formatHeading('h3')}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', transition: 'background var(--transition-fast)', color: textColor }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBgColor}
              onMouseLeave={(e) => e.currentTarget.style.background = bgColor}
            >
              Heading 3
            </button>
            <button
              onClick={() => formatQuote()}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', transition: 'background var(--transition-fast)', color: textColor }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBgColor}
              onMouseLeave={(e) => e.currentTarget.style.background = bgColor}
            >
              Quote
            </button>
            <button
              onClick={() => formatCode()}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', transition: 'background var(--transition-fast)', color: textColor }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBgColor}
              onMouseLeave={(e) => e.currentTarget.style.background = bgColor}
            >
              Code Block
            </button>
          </div>
        )}
      </div>

      <div style={{ height: '28px', width: '1px', backgroundColor: borderColor, alignSelf: 'center' }} />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          aria-label="Bold"
          style={{
            padding: '0.5rem 0.75rem',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: isBold ? 'var(--primary)' : bgColor,
            color: isBold ? 'white' : textColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all var(--transition-fast)',
            fontSize: '1.125rem',
          }}
          onMouseEnter={(e) => {
            if (!isBold) e.currentTarget.style.backgroundColor = hoverBgColor;
          }}
          onMouseLeave={(e) => {
            if (!isBold) e.currentTarget.style.backgroundColor = bgColor;
          }}
        >
          <MdFormatBold />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          aria-label="Italic"
          style={{
            padding: '0.5rem 0.75rem',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: isItalic ? 'var(--primary)' : bgColor,
            color: isItalic ? 'white' : textColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all var(--transition-fast)',
            fontSize: '1.125rem',
          }}
          onMouseEnter={(e) => {
            if (!isItalic) e.currentTarget.style.backgroundColor = hoverBgColor;
          }}
          onMouseLeave={(e) => {
            if (!isItalic) e.currentTarget.style.backgroundColor = bgColor;
          }}
        >
          <MdFormatItalic />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          aria-label="Underline"
          style={{
            padding: '0.5rem 0.75rem',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: isUnderline ? 'var(--primary)' : bgColor,
            color: isUnderline ? 'white' : textColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all var(--transition-fast)',
            fontSize: '1.125rem',
          }}
          onMouseEnter={(e) => {
            if (!isUnderline) e.currentTarget.style.backgroundColor = hoverBgColor;
          }}
          onMouseLeave={(e) => {
            if (!isUnderline) e.currentTarget.style.backgroundColor = bgColor;
          }}
        >
          <MdFormatUnderlined />
        </button>
      </div>

      <div style={{ height: '28px', width: '1px', backgroundColor: borderColor, alignSelf: 'center' }} />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={formatQuote}
          aria-label="Quote"
          style={{
            padding: '0.5rem 0.75rem',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: bgColor,
            color: textColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all var(--transition-fast)',
            fontSize: '1.125rem',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBgColor}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgColor}
        >
          <MdFormatQuote />
        </button>
        <button
          onClick={formatCode}
          aria-label="Code Block"
          style={{
            padding: '0.5rem 0.75rem',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: bgColor,
            color: textColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all var(--transition-fast)',
            fontSize: '1.125rem',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBgColor}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgColor}
        >
          <MdCode />
        </button>
      </div>

      <div style={{ height: '28px', width: '1px', backgroundColor: borderColor, alignSelf: 'center' }} />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => insertList('unordered')}
          aria-label="Bullet List"
          style={{
            padding: '0.5rem 0.75rem',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: bgColor,
            color: textColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all var(--transition-fast)',
            fontSize: '1.125rem',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBgColor}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgColor}
        >
          <MdFormatListBulleted />
        </button>
        <button
          onClick={() => insertList('ordered')}
          aria-label="Numbered List"
          style={{
            padding: '0.5rem 0.75rem',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: bgColor,
            color: textColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all var(--transition-fast)',
            fontSize: '1.125rem',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBgColor}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgColor}
        >
          <MdFormatListNumbered />
        </button>
      </div>
    </div>
  );
}
