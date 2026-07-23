"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useRef, useState, useEffect } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight,
  ImageIcon, Minus, RemoveFormatting,
  Loader2
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran maksimal file gambar adalah 5MB.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      
      if (data.success && data.data?.url) {
        editor.chain().focus().setImage({ src: data.data.url }).run();
      } else {
        alert(data.error || "Gagal mengunggah gambar");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat mengunggah gambar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rte-toolbar">
      {/* Basic Formatting */}
      <div className="rte-toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rte-btn ${editor.isActive("bold") ? "is-active" : ""}`}
          title="Bold"
        ><Bold size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rte-btn ${editor.isActive("italic") ? "is-active" : ""}`}
          title="Italic"
        ><Italic size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rte-btn ${editor.isActive("underline") ? "is-active" : ""}`}
          title="Underline"
        ><UnderlineIcon size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`rte-btn ${editor.isActive("strike") ? "is-active" : ""}`}
          title="Strikethrough"
        ><Strikethrough size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="rte-btn"
          title="Hapus Format"
        ><RemoveFormatting size={16} /></button>
      </div>

      <div className="rte-toolbar-divider" />

      {/* Headings */}
      <div className="rte-toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rte-btn ${editor.isActive("heading", { level: 1 }) ? "is-active" : ""}`}
          title="Heading 1"
        ><Heading1 size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rte-btn ${editor.isActive("heading", { level: 2 }) ? "is-active" : ""}`}
          title="Heading 2"
        ><Heading2 size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rte-btn ${editor.isActive("heading", { level: 3 }) ? "is-active" : ""}`}
          title="Heading 3"
        ><Heading3 size={16} /></button>
      </div>

      <div className="rte-toolbar-divider" />

      {/* Alignment */}
      <div className="rte-toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`rte-btn ${editor.isActive({ textAlign: "left" }) ? "is-active" : ""}`}
          title="Align Left"
        ><AlignLeft size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`rte-btn ${editor.isActive({ textAlign: "center" }) ? "is-active" : ""}`}
          title="Align Center"
        ><AlignCenter size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`rte-btn ${editor.isActive({ textAlign: "right" }) ? "is-active" : ""}`}
          title="Align Right"
        ><AlignRight size={16} /></button>
      </div>

      <div className="rte-toolbar-divider" />

      {/* Lists & Quotes */}
      <div className="rte-toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rte-btn ${editor.isActive("bulletList") ? "is-active" : ""}`}
          title="Bullet List"
        ><List size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rte-btn ${editor.isActive("orderedList") ? "is-active" : ""}`}
          title="Numbered List"
        ><ListOrdered size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`rte-btn ${editor.isActive("blockquote") ? "is-active" : ""}`}
          title="Blockquote"
        ><Quote size={16} /></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="rte-btn"
          title="Horizontal Line"
        ><Minus size={16} /></button>
      </div>

      <div className="rte-toolbar-divider" />

      {/* Insert Media */}
      <div className="rte-toolbar-group">
        <input 
          type="file" 
          accept="image/jpeg, image/png, image/webp, image/jpg" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          onChange={handleImageUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rte-btn"
          disabled={uploading}
          title="Insert Image"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          <span style={{ fontSize: "0.75rem", marginLeft: "4px", fontWeight: 500 }}>
            {uploading ? "Mengupload..." : "Gambar"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder = "Mulai tulis isi artikel di sini..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rte-image",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rte-content",
        placeholder,
      },
    },
  });

  // Effect to update content if it changes externally (e.g., when editing an existing post)
  // Be careful not to reset cursor position while typing
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="rte-container">
      <style dangerouslySetInnerHTML={{ __html: `
        .rte-container {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--surface);
          display: flex;
          flex-direction: column;
        }
        .rte-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          padding: 0.5rem;
          background: var(--surface-2);
          border-bottom: 1px solid var(--border);
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .rte-toolbar-group {
          display: flex;
          gap: 0.25rem;
        }
        .rte-toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--border);
          margin: 0 0.25rem;
        }
        .rte-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rte-btn:hover {
          background: rgba(0,0,0,0.05);
          color: var(--text-primary);
        }
        .rte-btn.is-active {
          background: var(--primary-light);
          color: var(--primary);
        }
        .rte-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .rte-content {
          padding: 1rem 1.5rem;
          min-height: 400px;
          max-height: 60vh;
          overflow-y: auto;
          outline: none;
          font-family: inherit;
          color: var(--text-primary);
          line-height: 1.6;
        }
        
        /* Prose Styles inside Editor */
        .rte-content p.is-editor-empty:first-child::before {
          content: attr(placeholder);
          float: left;
          color: var(--text-muted);
          pointer-events: none;
          height: 0;
        }
        .rte-content h1 { font-size: 2rem; font-weight: 800; margin: 1.5em 0 0.5em; line-height: 1.2; }
        .rte-content h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5em 0 0.5em; line-height: 1.3; }
        .rte-content h3 { font-size: 1.25rem; font-weight: 600; margin: 1.5em 0 0.5em; line-height: 1.4; }
        .rte-content p { margin-bottom: 1em; }
        .rte-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1em; }
        .rte-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1em; }
        .rte-content blockquote {
          border-left: 4px solid var(--primary);
          padding-left: 1rem;
          color: var(--text-secondary);
          font-style: italic;
          margin: 1.5em 0;
          background: var(--surface-2);
          padding: 1rem;
          border-radius: 0 8px 8px 0;
        }
        .rte-content hr {
          border: none;
          border-top: 2px solid var(--border);
          margin: 2rem 0;
        }
        .rte-content .rte-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem auto;
          display: block;
        }
        .rte-content .rte-image.ProseMirror-selectednode {
          outline: 3px solid var(--primary);
        }
      ` }} />
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
