'use client';

import { useEffect, useState, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import DOMPurify from 'dompurify';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot } from 'lexical';
import { nodes } from './LexicalNodes';
import { theme } from './LexicalConfig';
import { Toolbar } from './lexical/Toolbar';

const EditorContent = ({ isDarkMode }) => {
  return (
    <Box
      className="editor-inner"
      bg={isDarkMode ? 'gray.800' : 'white'}
      color={isDarkMode ? 'gray.100' : 'gray.800'}
      minH="150px"
      p={4}
      overflowY="auto"
      style={{
        outline: 'none',
        caretColor: isDarkMode ? '#f7fafc' : '#1a202c',
      }}
    >
      <ContentEditable
        style={{
          minHeight: '150px',
        }}
      />
    </Box>
  );
};

const Placeholder = ({ text, isDarkMode }) => {
  return (
    <Box
      position="absolute"
      top={4}
      left={4}
      color={isDarkMode ? 'gray.500' : 'gray.400'}
      pointerEvents="none"
      userSelect="none"
    >
      {text}
    </Box>
  );
};

const EmptyStatePlugin = ({ placeholder, isDarkMode }) => {
  const [editor] = useLexicalComposerContext();
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const isEmptyState = root.getChildrenSize() === 1 &&
          root.getFirstChild().getTextContent() === '';
        setIsEmpty(isEmptyState);
      });
    });
  }, [editor]);

  return isEmpty ? <Placeholder text={placeholder} isDarkMode={isDarkMode} /> : null;
};

// Internal component to handle editor updates
const EditorUpdater = ({ value, onChange }) => {
  const [editor] = useLexicalComposerContext();
  const isInternalChangeRef = useRef(false);

  // Update editor when value prop changes externally
  useEffect(() => {
    if (value === undefined || value === null) return;

    editor.update(() => {
      const currentHtml = $generateHtmlFromNodes(editor, null);

      // Only update if the HTML is different (external change)
      if (currentHtml !== value) {
        isInternalChangeRef.current = true;
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      }
    });
  }, [editor, value]);

  // Handle internal changes
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      // Only handle changes made by user interaction
      if (isInternalChangeRef.current) {
        isInternalChangeRef.current = false;
        return;
      }

      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
        return;
      }

      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);

        // Only call onChange if HTML changed
        if (html !== value) {
          onChange(html);
        }
      });
    });
  }, [editor, onChange, value]);

  return null;
};

const RichTextEditor = ({ value, onChange, placeholder = 'Enter content here...' }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detect dark mode
    const checkDarkMode = () => {
      const mode = localStorage.getItem('chakra-ui-color-mode');
      const htmlEl = document.documentElement;
      setIsDarkMode(
        mode === 'dark' ||
        htmlEl.classList.contains('chakra-ui-dark') ||
        htmlEl.getAttribute('data-color-mode') === 'dark'
      );
    };

    checkDarkMode();

    // Watch for mode changes
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-color-mode']
    });

    return () => observer.disconnect();
  }, []);

  const initialEditorState = value ? (editor) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(value, 'text/html');
    return $generateNodesFromDOM(editor, dom);
  } : undefined;

  return (
    <Box
      className="rich-text-editor-wrapper"
      data-dark={isDarkMode}
      border="1px"
      borderColor={isDarkMode ? "gray.600" : "gray.300"}
      borderRadius="md"
      overflow="hidden"
      bg={isDarkMode ? "gray.900" : "white"}
      position="relative"
    >
      <LexicalComposer
        initialConfig={{
          namespace: 'RichTextEditor',
          theme,
          nodes,
          editorState: initialEditorState,
          onError: (error) => {
            console.error('Lexical error:', error);
          },
        }}
      >
        <Toolbar />
        <Box position="relative">
          <RichTextPlugin
            contentEditable={<EditorContent isDarkMode={isDarkMode} />}
          />
          <EmptyStatePlugin placeholder={placeholder} isDarkMode={isDarkMode} />
          <HistoryPlugin />
          <EditorUpdater value={value} onChange={onChange} />
        </Box>
      </LexicalComposer>
    </Box>
  );
};

// Component to safely render HTML content
export const RichTextDisplay = ({ content }) => {
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && content) {
      const clean = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
      });
      setSanitizedContent(clean);
    } else {
      setSanitizedContent(content || '');
    }
  }, [content]);

  return (
    <Box
      className="rich-text-display"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

// Utility function to strip HTML tags for previews
export const stripHtml = (html) => {
  if (!html) return '';
  if (typeof window === 'undefined') {
    // Fallback for SSR: simple regex to remove tags
    return html.replace(/<[^>]*>/g, '').trim();
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export default RichTextEditor;
