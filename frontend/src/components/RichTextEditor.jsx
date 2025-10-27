import { useRef } from 'react';
import { Box } from '@chakra-ui/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

const RichTextEditor = ({ value, onChange, placeholder = 'Enter content here...' }) => {
  const quillRef = useRef(null);

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
    <>
      <style>{`
        .ql-editor {
          min-height: 150px;
          max-height: 400px;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </>
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
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      css={{
        '& h1, & h2, & h3': {
          fontWeight: 'bold',
          marginTop: '1em',
          marginBottom: '0.5em'
        },
        '& h1': { fontSize: '1.875rem' },
        '& h2': { fontSize: '1.5rem' },
        '& h3': { fontSize: '1.25rem' },
        '& p': {
          marginBottom: '0.75rem',
          lineHeight: '1.6'
        },
        '& ul, & ol': {
          marginLeft: '1.5rem',
          marginBottom: '0.75rem'
        },
        '& li': {
          marginBottom: '0.25rem'
        },
        '& a': {
          color: '#3182ce',
          textDecoration: 'underline'
        },
        '& strong': {
          fontWeight: 'bold'
        },
        '& em': {
          fontStyle: 'italic'
        },
        '& u': {
          textDecoration: 'underline'
        }
      }}
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
