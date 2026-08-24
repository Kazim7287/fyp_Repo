import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

import {
  Button,
  Space,
  Divider,
} from "antd";

import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],

    content: value || "",

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* TOOLBAR */}

      <div
        style={{
          padding: 8,
          borderBottom: "1px solid #d9d9d9",
          background: "#fafafa",
        }}
      >
        <Space wrap>
          <Button
            type={editor.isActive("bold") ? "primary" : "default"}
            icon={<BoldOutlined />}
            onClick={() =>
              editor.chain().focus().toggleBold().run()
            }
          />

          <Button
            type={editor.isActive("italic") ? "primary" : "default"}
            icon={<ItalicOutlined />}
            onClick={() =>
              editor.chain().focus().toggleItalic().run()
            }
          />

          <Button
            type={
              editor.isActive("bulletList")
                ? "primary"
                : "default"
            }
            icon={<UnorderedListOutlined />}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }
          />

          <Button
            type={
              editor.isActive("orderedList")
                ? "primary"
                : "default"
            }
            icon={<OrderedListOutlined />}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
          />

          <Divider
            type="vertical"
          />

          <Button
            icon={<LinkOutlined />}
            onClick={() => {
              const url = window.prompt(
                "Enter URL:"
              );

              if (url) {
                editor
                  .chain()
                  .focus()
                  .setLink({
                    href: url,
                  })
                  .run();
              }
            }}
          >
            Link
          </Button>
        </Space>
      </div>

      {/* EDITOR */}

      <EditorContent
        editor={editor}
        style={{
          minHeight: 300,
          padding: 16,
        }}
      />
    </div>
  );
};

export default RichTextEditor;