// Lexical Rich Text Editor Component for Admin

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  $getRoot,
  $getSelection,
  $createParagraphNode,
  $createTextNode,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL
} from 'lexical'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode
} from '@lexical/rich-text'
import {
  ListItemNode,
  ListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  $isListNode,
  $createListNode,
  $createListItemNode
} from '@lexical/list'
import { CodeHighlightNode, CodeNode, $createCodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $setBlocksType } from '@lexical/selection'
import { EditorState } from 'lexical'

interface LexicalEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Toolbar component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [blockType, setBlockType] = useState('paragraph')
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState('15')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isLink, setIsLink] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      const element = anchorNode.getKey() === 'root'
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow()
      const elementKey = element.getKey()
      const elementDOM = editor.getElementByKey(elementKey)

      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsCode(selection.hasFormat('code'))

      // Update block type
      if ($isListNode(element)) {
        const type = element.getListType()
        setBlockType(type)
      } else {
        const type = $isHeadingNode(element) ? element.getTag() : element.getType()
        setBlockType(type)
      }
      setSelectedElementKey(elementKey)
    }
  }, [editor])

  useEffect(() => {
    const unregisterUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })

    const unregisterSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    const unregisterUndoListener = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload)
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    const unregisterRedoListener = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload)
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    return () => {
      unregisterUpdateListener()
      unregisterSelectionListener()
      unregisterUndoListener()
      unregisterRedoListener()
    }
  }, [editor, updateToolbar])

  const formatText = (format: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.formatText(format as any)
      }
    })
  }

  const formatParagraph = (blockType: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (blockType === 'paragraph') {
          $setBlocksType(selection, () => $createParagraphNode())
        } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(blockType)) {
          $setBlocksType(selection, () => $createHeadingNode(blockType as any))
        } else if (blockType === 'bullet') {
          formatBulletList()
        } else if (blockType === 'number') {
          formatNumberedList()
        } else if (blockType === 'quote') {
          $setBlocksType(selection, () => $createQuoteNode())
        } else if (blockType === 'code') {
          $setBlocksType(selection, () => $createCodeNode())
        }
      }
    })
  }

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  }

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const formatCode = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (selection.isCollapsed()) {
          $setBlocksType(selection, () => $createCodeNode())
        } else {
          selection.formatText('code')
        }
      }
    })
  }

  const insertLink = () => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }

  const onFontSizeSelect = (option: string) => {
    // Font size styling will be implemented later
    setFontSize(option)
  }

  return (
    <div className="flex items-center space-x-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap gap-1">
      {/* Undo/Redo */}
      <button
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      <button
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Block Type Selector */}
      <select
        className="px-2 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={blockType}
        onChange={(e) => formatParagraph(e.target.value)}
      >
        <option value="paragraph">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
        <option value="bullet">Bullet List</option>
        <option value="number">Numbered List</option>
        <option value="check">Check List</option>
        <option value="quote">Quote</option>
        <option value="code">Code Block</option>
      </select>



      {/* Font Size */}
      <select
        className="px-2 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={fontSize}
        onChange={(e) => onFontSizeSelect(e.target.value)}
      >
        <option value="10">10</option>
        <option value="11">11</option>
        <option value="12">12</option>
        <option value="13">13</option>
        <option value="14">14</option>
        <option value="15">15</option>
        <option value="16">16</option>
        <option value="17">17</option>
        <option value="18">18</option>
        <option value="20">20</option>
        <option value="22">22</option>
        <option value="24">24</option>
        <option value="26">26</option>
        <option value="28">28</option>
        <option value="30">30</option>
        <option value="32">32</option>
        <option value="34">34</option>
        <option value="36">36</option>
      </select>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Formatting */}
      <button
        onClick={() => formatText('bold')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
          isBold
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="Bold"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
        </svg>
      </button>

      <button
        onClick={() => formatText('italic')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
          isItalic
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="Italic"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
        </svg>
      </button>

      <button
        onClick={() => formatText('underline')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
          isUnderline
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="Underline"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 21h14v-2H5v2zM12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6z"/>
        </svg>
      </button>

      <button
        onClick={() => formatText('strikethrough')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
          isStrikethrough
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="Strikethrough"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
        </svg>
      </button>

      <button
        onClick={() => formatText('code')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
          isCode
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="Code"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Link */}
      <button
        onClick={insertLink}
        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        title="Insert Link"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
        </svg>
      </button>
    </div>
  )
}

// Plugin to sync content with parent component
function OnChangeContentPlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null)
        onChange(htmlString)
      })
    })
  }, [editor, onChange])

  return null
}

// Helper function to convert JSON content to Lexical nodes
function convertJSONToLexicalNodes(editor: any, jsonContent: any): any[] {
  if (typeof jsonContent === 'string') {
    // If it's a string, create a simple paragraph
    const paragraphNode = $createParagraphNode()
    const textNode = $createTextNode(jsonContent)
    paragraphNode.append(textNode)
    return [paragraphNode]
  }

  if (jsonContent && typeof jsonContent === 'object') {
    // Handle structured JSON content from AI Formatter
    if (jsonContent.type === 'doc' && jsonContent.content) {
      return jsonContent.content.map((block: any) => convertBlockToLexicalNode(block)).filter(Boolean)
    }

    if (Array.isArray(jsonContent)) {
      return jsonContent.map(block => convertBlockToLexicalNode(block)).filter(Boolean)
    }
  }

  return []
}

// Convert individual blocks to Lexical nodes
function convertBlockToLexicalNode(block: any): any {
  if (!block || !block.type) return null

  switch (block.type) {
    case 'heading':
      const headingNode = $createHeadingNode(`h${block.attrs?.level || 2}` as any)
      if (block.content) {
        block.content.forEach((inline: any) => {
          if (inline.type === 'text' && inline.text) {
            headingNode.append($createTextNode(inline.text))
          }
        })
      }
      return headingNode

    case 'blockquote':
      const quoteNode = $createQuoteNode()
      if (block.content) {
        block.content.forEach((subBlock: any) => {
          const subNode = convertBlockToLexicalNode(subBlock)
          if (subNode) {
            quoteNode.append(subNode)
          }
        })
      }
      return quoteNode

    case 'ordered_list':
    case 'bullet_list':
      const listNode = $createListNode(block.type === 'ordered_list' ? 'number' : 'bullet')
      if (block.content) {
        block.content.forEach((listItem: any) => {
          if (listItem.type === 'list_item') {
            const listItemNode = $createListItemNode()
            if (listItem.content) {
              listItem.content.forEach((subBlock: any) => {
                const subNode = convertBlockToLexicalNode(subBlock)
                if (subNode) {
                  listItemNode.append(subNode)
                }
              })
            }
            listNode.append(listItemNode)
          }
        })
      }
      return listNode

    case 'paragraph':
    default:
      const paragraphNode = $createParagraphNode()
      if (block.content) {
        block.content.forEach((inline: any) => {
          if (inline.type === 'text' && inline.text) {
            paragraphNode.append($createTextNode(inline.text))
          }
        })
      } else if (block.text) {
        paragraphNode.append($createTextNode(block.text))
      }
      return paragraphNode
  }
}

// Helper function to extract plain text from JSON (fallback)
function extractTextFromJSON(jsonContent: any): string {
  if (typeof jsonContent === 'string') {
    return jsonContent
  }

  if (jsonContent && typeof jsonContent === 'object') {
    // Handle the JSON structure
    if (jsonContent.type === 'doc' && jsonContent.content) {
      return jsonContent.content
        .map((block: any) => {
          if (block.content) {
            return block.content
              .map((inline: any) => inline.text || '')
              .join('')
          }
          return block.text || ''
        })
        .filter((text: string) => text.trim())
        .join('\n\n')
    }

    // Handle other possible JSON structures
    if (jsonContent.content) {
      return extractTextFromJSON(jsonContent.content)
    }

    if (Array.isArray(jsonContent)) {
      return jsonContent.map(extractTextFromJSON).join('\n\n')
    }

    if (jsonContent.text) {
      return jsonContent.text
    }
  }

  return ''
}

// Plugin to set initial content
function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext()
  const lastContent = useRef<string>('')
  const isInitialized = useRef(false)

  useEffect(() => {
    // Only initialize once when the component first mounts
    if (!isInitialized.current && initialContent && initialContent.trim()) {
      isInitialized.current = true
      lastContent.current = initialContent

      editor.update(() => {
        try {
          const root = $getRoot()
          root.clear()

          let contentToProcess = initialContent.trim()

          // Check if content is JSON (structured content)
          if (contentToProcess.startsWith('{') || contentToProcess.startsWith('[')) {
            try {
              const jsonContent = JSON.parse(contentToProcess)

              // Try to convert JSON to Lexical nodes first
              const lexicalNodes = convertJSONToLexicalNodes(editor, jsonContent)
              if (lexicalNodes.length > 0) {
                root.append(...lexicalNodes)
                return
              }

              // Fallback to extracting text
              contentToProcess = extractTextFromJSON(jsonContent)
            } catch (jsonError) {
              console.log('Content is not valid JSON, treating as text')
            }
          }

          // If content looks like HTML, parse it
          if (contentToProcess.includes('<') && contentToProcess.includes('>')) {
            const parser = new DOMParser()
            const dom = parser.parseFromString(contentToProcess, 'text/html')
            const nodes = $generateNodesFromDOM(editor, dom)
            root.append(...nodes)
          } else {
            // Split text into paragraphs and create paragraph nodes
            const paragraphs = contentToProcess.split('\n\n').filter(p => p.trim())

            if (paragraphs.length === 0) {
              // Empty content, create empty paragraph
              const paragraphNode = $createParagraphNode()
              root.append(paragraphNode)
            } else {
              // Create paragraph nodes for each paragraph
              paragraphs.forEach(paragraphText => {
                const paragraphNode = $createParagraphNode()
                const textNode = $createTextNode(paragraphText.trim())
                paragraphNode.append(textNode)
                root.append(paragraphNode)
              })
            }
          }
        } catch (error) {
          console.error('Error setting initial content:', error)
          // Fallback to plain text
          const root = $getRoot()
          root.clear()
          const paragraphNode = $createParagraphNode()
          const textNode = $createTextNode(initialContent)
          paragraphNode.append(textNode)
          root.append(paragraphNode)
        }
      })
    }
  }, [editor, initialContent])

  return null
}





const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  paragraph: 'mb-2',
  heading: {
    h1: 'text-2xl font-bold mb-4',
    h2: 'text-xl font-bold mb-3',
    h3: 'text-lg font-bold mb-2',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal list-inside mb-2',
    ul: 'list-disc list-inside mb-2',
    listitem: 'mb-1',
  },
  quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4',
  code: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
  codeHighlight: {
    atrule: 'text-purple-600',
    attr: 'text-blue-600',
    boolean: 'text-red-600',
    builtin: 'text-purple-600',
    cdata: 'text-gray-600',
    char: 'text-green-600',
    class: 'text-blue-600',
    'class-name': 'text-blue-600',
    comment: 'text-gray-500',
    constant: 'text-red-600',
    deleted: 'text-red-600',
    doctype: 'text-gray-600',
    entity: 'text-orange-600',
    function: 'text-purple-600',
    important: 'text-red-600',
    inserted: 'text-green-600',
    keyword: 'text-purple-600',
    namespace: 'text-blue-600',
    number: 'text-red-600',
    operator: 'text-gray-700',
    prolog: 'text-gray-600',
    property: 'text-blue-600',
    punctuation: 'text-gray-700',
    regex: 'text-green-600',
    selector: 'text-green-600',
    string: 'text-green-600',
    symbol: 'text-red-600',
    tag: 'text-red-600',
    url: 'text-blue-600',
    variable: 'text-orange-600',
  },
}

export default function LexicalEditor({
  value,
  onChange,
  placeholder = "Start writing your post...",
  className = ""
}: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'ForgeJournalEditor',
    theme,
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
    ],
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="w-full min-h-[400px] p-4 focus:outline-none text-base leading-relaxed resize-none"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            }
            placeholder={
              <div
                className="absolute top-4 left-4 text-gray-400 pointer-events-none"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangeContentPlugin onChange={onChange} />
          <InitialContentPlugin initialContent={value} />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
        </div>
      </LexicalComposer>
    </div>
  )
}


