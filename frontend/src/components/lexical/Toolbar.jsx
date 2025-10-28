'use client';

import { Box, ButtonGroup, IconButton, Menu, MenuButton, MenuList, MenuItem, Divider } from '@chakra-ui/react';
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
    <Box
      borderBottom="1px"
      borderColor="gray.300"
      _dark={{ borderColor: 'gray.600' }}
      p={2}
      bg="gray.50"
      _dark={{ bg: 'gray.800' }}
      display="flex"
      gap={1}
      flexWrap="wrap"
    >
      <Menu>
        <MenuButton size="sm">Format</MenuButton>
        <MenuList>
          <MenuItem onClick={() => formatParagraph()}>Paragraph</MenuItem>
          <MenuItem onClick={() => formatHeading('h1')}>Heading 1</MenuItem>
          <MenuItem onClick={() => formatHeading('h2')}>Heading 2</MenuItem>
          <MenuItem onClick={() => formatHeading('h3')}>Heading 3</MenuItem>
          <MenuItem onClick={() => formatQuote()}>Quote</MenuItem>
          <MenuItem onClick={() => formatCode()}>Code Block</MenuItem>
        </MenuList>
      </Menu>

      <Divider orientation="vertical" />

      <ButtonGroup size="sm" isAttached>
        <IconButton
          icon={<MdFormatBold />}
          aria-label="Bold"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          colorScheme={isBold ? 'blue' : 'gray'}
          variant={isBold ? 'solid' : 'ghost'}
        />
        <IconButton
          icon={<MdFormatItalic />}
          aria-label="Italic"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          colorScheme={isItalic ? 'blue' : 'gray'}
          variant={isItalic ? 'solid' : 'ghost'}
        />
        <IconButton
          icon={<MdFormatUnderlined />}
          aria-label="Underline"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          colorScheme={isUnderline ? 'blue' : 'gray'}
          variant={isUnderline ? 'solid' : 'ghost'}
        />
      </ButtonGroup>

      <Divider orientation="vertical" />

      <ButtonGroup size="sm" isAttached>
        <IconButton
          icon={<MdFormatQuote />}
          aria-label="Quote"
          onClick={formatQuote}
          variant="ghost"
        />
        <IconButton
          icon={<MdCode />}
          aria-label="Code Block"
          onClick={formatCode}
          variant="ghost"
        />
      </ButtonGroup>

      <Divider orientation="vertical" />

      <ButtonGroup size="sm" isAttached>
        <IconButton
          icon={<MdFormatListBulleted />}
          aria-label="Bullet List"
          onClick={() => insertList('unordered')}
          variant="ghost"
        />
        <IconButton
          icon={<MdFormatListNumbered />}
          aria-label="Numbered List"
          onClick={() => insertList('ordered')}
          variant="ghost"
        />
      </ButtonGroup>
    </Box>
  );
}
