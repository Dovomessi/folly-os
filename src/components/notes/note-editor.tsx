'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { common, createLowlight } from 'lowlight'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Link2,
  Table2,
  Minus,
  Underline,
} from 'lucide-react'

const lowlight = createLowlight(common)

interface NoteEditorProps {
  content: string
  onUpdate: (content: string, contentHtml: string, wordCount: number) => void
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-[#5E6AD2]/20 text-[#5E6AD2]'
          : 'text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-[#2A2D37]'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-[#2A2D37] mx-1" />
}

export function NoteEditor({ content, onUpdate }: NoteEditorProps) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // use CodeBlockLowlight instead
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Commencez à écrire...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose-invert focus:outline-none min-h-[400px]',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const text = editor.getText()
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        onUpdate(text, html, wordCount)
      }, 1000)
    },
  })

  // Update content if it changes externally (e.g., initial load)
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentHtml = editor.getHTML()
      if (currentHtml !== content && content !== '') {
        editor.commands.setContent(content)
      }
    }
    // Only run when content prop changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  const addLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL du lien', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const insertTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-4 py-2 border-b border-[#2A2D37] bg-[#161922] sticky top-0 z-10">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Gras (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italique (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Barré"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Titre H1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Titre H2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Titre H3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Liste numérotée"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Bloc de code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Citation"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Link & Table */}
        <ToolbarButton
          onClick={addLink}
          active={editor.isActive('link')}
          title="Insérer un lien"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={insertTable}
          active={editor.isActive('table')}
          title="Insérer un tableau"
        >
          <Table2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Séparateur"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <EditorContent
          editor={editor}
          className="h-full px-8 py-6"
        />
      </div>
    </div>
  )
}
