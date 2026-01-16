"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Table as TableIcon,
    Undo,
    Redo
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
            },
        },
    })

    if (!editor) {
        return null
    }

    const addLink = () => {
        const url = window.prompt('Enter URL:')
        if (url) {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-gray-200' : ''}
                >
                    <Bold className="w-4 h-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-gray-200' : ''}
                >
                    <Italic className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
                >
                    <Heading2 className="w-4 h-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
                >
                    <Heading3 className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
                >
                    <List className="w-4 h-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
                >
                    <ListOrdered className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addLink}
                    className={editor.isActive('link') ? 'bg-gray-200' : ''}
                >
                    <LinkIcon className="w-4 h-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addTable}
                >
                    <TableIcon className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo className="w-4 h-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo className="w-4 h-4" />
                </Button>
            </div>

            {/* Editor */}
            <div className="bg-white">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
