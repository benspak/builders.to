'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <Box minH="150px" border="1px" borderColor="gray.300" borderRadius="md" p={4} color="gray.400">Loading editor...</Box>
});

// Dynamically import DOMPurify for client-side only
import DOMPurify from 'dompurify';

const RichTextEditor = ({ value, onChange, placeholder = 'Enter content here...' }) => {
  const quillRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detect dark mode
    const checkDarkMode = () => {
      const mode = localStorage.getItem('chakra-ui-color-mode');
      const htmlEl = document.documentElement;
      setIsDarkMode(mode === 'dark' || htmlEl.classList.contains('chakra-ui-dark') || htmlEl.getAttribute('data-color-mode') === 'dark');
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

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link'
  ];

  return (
    <Box className="rich-text-editor-wrapper" data-dark={isDarkMode}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
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
