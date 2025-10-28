import { useRef, useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });

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
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export default RichTextEditor;
