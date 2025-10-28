/**
 * Lexical editor theme configuration
 */

export const theme = {
  // Paragraph styles
  paragraph: 'mb-2',
  // Text styling
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-gray-100 px-1 rounded',
    highlight: 'bg-yellow-200',
  },
  // Heading styles
  heading: {
    h1: 'text-4xl font-bold mb-2',
    h2: 'text-3xl font-bold mb-2',
    h3: 'text-2xl font-bold mb-2',
  },
  // List styles
  list: {
    nested: { listitem: 'ml-8' },
    ol: 'list-decimal ml-8',
    ul: 'list-disc ml-8',
    listitem: 'list-item',
  },
  // Link styles
  link: 'text-blue-600 underline hover:underline',
  // Quote styles
  quote: 'border-l-4 border-gray-300 pl-4 italic my-4',
};
