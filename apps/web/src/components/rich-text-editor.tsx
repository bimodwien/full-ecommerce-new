'use client';

import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, LinkIcon } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export type RichTextEditorProps = {
  value?: string; // HTML
  onChange?: (html: string, plainText: string) => void;
  className?: string;
  placeholder?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  className,
  placeholder = 'Write something…',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      const html = editor.getHTML();
      const text = editor.getText();
      onChange?.(html, text);
    },
    editorProps: {
      attributes: {
        class: cn(
          'tiptap-content w-full bg-transparent outline-none',
          // Match shadcn Textarea padding and font sizing
          'min-h-48 px-3 py-2 text-base md:text-sm',
        ),
      },
    },
  });

  // Force re-render when editor state changes so toolbar isActive reflects immediately
  const [_, setTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const rerender = () => setTick((t) => (t + 1) % 1000);
    editor.on('selectionUpdate', rerender);
    editor.on('transaction', rerender);
    editor.on('update', rerender);
    editor.on('focus', rerender);
    editor.on('blur', rerender);
    return () => {
      editor.off('selectionUpdate', rerender);
      editor.off('transaction', rerender);
      editor.off('update', rerender);
      editor.off('focus', rerender);
      editor.off('blur', rerender);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value != null && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL', prev ?? 'https://');
    if (url === null) return; // cancel
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={cn('group', className)}>
      <div
        className={cn(
          // Match shadcn Textarea container look & focus ring
          'rounded-md border border-input shadow-xs bg-transparent transition-[color,box-shadow]',
          'focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring',
        )}
      >
        <div className="border-b p-2 flex gap-1">
          {(() => {
            const isBold = editor.isActive('bold');
            const isItalic = editor.isActive('italic');
            const isBullet = editor.isActive('bulletList');
            const isLink = editor.isActive('link');
            const canBold = editor.can().chain().focus().toggleBold().run();
            const canItalic = editor.can().chain().focus().toggleItalic().run();
            const canBullet = editor
              .can()
              .chain()
              .focus()
              .toggleBulletList()
              .run();
            return (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`relative cursor-pointer tiptap-toolbar-btn p-1 h-8 w-8 ${isBold ? 'text-green-600 rt-btn-active' : ''}`}
                  data-active={isBold}
                  aria-pressed={isBold}
                  disabled={!canBold}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`relative cursor-pointer tiptap-toolbar-btn p-1 h-8 w-8 ${isItalic ? 'text-green-600 rt-btn-active' : ''}`}
                  data-active={isItalic}
                  aria-pressed={isItalic}
                  disabled={!canItalic}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`relative cursor-pointer tiptap-toolbar-btn p-1 h-8 w-8 ${isBullet ? 'text-green-600 rt-btn-active' : ''}`}
                  data-active={isBullet}
                  aria-pressed={isBullet}
                  disabled={!canBullet}
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`relative cursor-pointer tiptap-toolbar-btn p-1 h-8 w-8 ${isLink ? 'text-green-600 rt-btn-active' : ''}`}
                  data-active={isLink}
                  aria-pressed={isLink}
                  onClick={setLink}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </>
            );
          })()}
        </div>
        <div className="relative">
          {/* Placeholder overlay when empty and not focused */}
          {editor.isEmpty && !editor.isFocused && (
            <div className="pointer-events-none absolute inset-0 text-muted-foreground px-3 py-2 text-sm select-none">
              {placeholder}
            </div>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
