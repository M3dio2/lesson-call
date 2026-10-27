"use client";

import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type * as Y from "yjs";

// Shared rich-text pad. The Y.Doc is synced by useYjsSync in LessonRoom.
export default function TextPad({ doc }: { doc: Y.Doc }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // Undo/redo comes from the Collaboration extension, so only your own edits are undone.
      StarterKit.configure({ undoRedo: false }),
      Collaboration.configure({ document: doc }),
    ],
    editorProps: {
      attributes: { class: "tiptap min-h-full p-4 text-lg outline-none" },
    },
  });

  return (
    <div className="flex h-full w-full flex-col bg-white text-neutral-900">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="min-h-0 flex-1 overflow-y-auto" />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      heading: editor.isActive("heading", { level: 2 }),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
    }),
  });

  const buttons = [
    {
      label: "B",
      title: "Bold",
      on: active.bold,
      run: () => editor.chain().focus().toggleBold().run(),
      className: "font-bold",
    },
    {
      label: "I",
      title: "Italic",
      on: active.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
      className: "italic",
    },
    {
      label: "U",
      title: "Underline",
      on: active.underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
      className: "underline",
    },
    {
      label: "S",
      title: "Strikethrough (for corrections)",
      on: active.strike,
      run: () => editor.chain().focus().toggleStrike().run(),
      className: "line-through",
    },
    {
      label: "H",
      title: "Heading",
      on: active.heading,
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      className: "font-semibold",
    },
    {
      label: "• List",
      title: "Bullet list",
      on: active.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "1. List",
      title: "Numbered list",
      on: active.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-neutral-200 p-2">
      {buttons.map((b) => (
        <button
          key={b.title}
          title={b.title}
          onClick={b.run}
          className={`rounded px-2.5 py-1 text-sm ${b.className ?? ""} ${
            b.on ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"
          }`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
