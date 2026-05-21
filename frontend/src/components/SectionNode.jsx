import React, {
  useState,
  useEffect,
} from "react";

import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

export default function SectionNode({
  section,
  depth = 0,
  onAddChild,
  onDelete,
}) {
  const [expanded, setExpanded] =
    useState(true);

  const [title, setTitle] = useState(
    section.title
  );

  const [content, setContent] =
    useState(section.content || "");

  const [
    editingContent,
    setEditingContent,
  ] = useState(false);

  const hasChildren =
    section.children &&
    section.children.length > 0;

  // =========================
  // DND
  // =========================
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: section._id,
  });

  const style = {
    transform:
      CSS.Transform.toString(transform),
    transition,
  };

  // =========================
  // SAVE TITLE
  // =========================
  async function saveTitle() {
    try {
      await fetch(
        `http://localhost:3000/sections/${section._id}/title`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
          }),
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  // =========================
  // SAVE CONTENT
  // =========================
  async function saveContent(
    newContent
  ) {
    try {
      await fetch(
        `http://localhost:3000/sections/${section._id}/content`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            content: newContent,
          }),
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  // =========================
  // AUTOSAVE TITLE
  // =========================
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveTitle();
    }, 500);

    return () =>
      clearTimeout(timeout);
  }, [title]);

  // =========================
  // AUTOSAVE CONTENT
  // =========================
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveContent(content);
    }, 500);

    return () =>
      clearTimeout(timeout);
  }, [content]);

  // =========================
  // DELETE
  // =========================
  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${section.title}" and all children?`
    );

    if (!confirmed) return;

    onDelete(section._id);
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginLeft: depth * 20,
        borderLeft:
          depth > 0
            ? "1px solid #d1d5db"
            : "none",
        paddingLeft:
          depth > 0
            ? "12px"
            : "0px",
        marginTop: "8px",
      }}
    >
      {/* NODE */}
      <div
        style={{
          padding: "10px",
          marginBottom: "6px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          cursor: "default",
        }}
      >
        {/* TOP ROW */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "8px",
          }}
        >
          {/* LEFT */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: 1,
            }}
          >
            {/* DRAG HANDLE */}
            <div
              {...attributes}
              {...listeners}
              style={{
                cursor: "grab",
                padding: "4px",
                color: "#6b7280",
                userSelect: "none",
              }}
            >
              ☰
            </div>

            {/* EXPAND */}
            {hasChildren ? (
              <button
                onClick={() =>
                  setExpanded(
                    !expanded
                  )
                }
                style={{
                  border: "none",
                  background:
                    "transparent",
                  cursor: "pointer",
                  fontSize: "12px",
                  width: "18px",
                }}
              >
                {expanded
                  ? "▼"
                  : "▶"}
              </button>
            ) : (
              <span
                style={{
                  width: "18px",
                }}
              >
                └
              </span>
            )}

            {/* TITLE */}
            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "14px",
                width: "100%",
                fontWeight: "600",
              }}
            />
          </div>

          {/* RIGHT */}
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            {/* ADD CHILD */}
            <button
              onClick={() =>
                onAddChild(
                  section._id
                )
              }
              style={{
                border:
                  "1px solid #ddd",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                background:
                  "#f9fafb",
              }}
            >
              + Child
            </button>

            {/* DELETE */}
            <button
              onClick={
                handleDelete
              }
              style={{
                border:
                  "1px solid #fecaca",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                background:
                  "#fef2f2",
                color: "#dc2626",
              }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div
          style={{
            marginTop: "4px",
          }}
        >
          {editingContent ? (
            <>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() =>
                    setContent(content + "\n**bold**")
                  }
                  type="button"
                >
                  Bold
                </button>

                <button
                  onClick={() =>
                    setContent(content + "\n*italic*")
                  }
                  type="button"
                >
                  Italic
                </button>

                <button
                  onClick={() =>
                    setContent(content + "\n# Heading")
                  }
                  type="button"
                >
                  H1
                </button>

                <button
                  onClick={() =>
                    setContent(
                      content + "\n- List Item"
                    )
                  }
                  type="button"
                >
                  List
                </button>

                <button
                  onClick={() =>
                    setContent(
                      content +
                        "\n```js\nconsole.log('hello')\n```"
                    )
                  }
                  type="button"
                >
                  Code
                </button>
              </div>

              <textarea
                value={content}
                onPointerDown={(e) =>
                  e.stopPropagation()
                }
                onChange={(e) => {
                  setContent(
                    e.target.value
                  );
                }}
                onBlur={async () => {
                  await saveContent(
                    content
                  );

                  setEditingContent(
                    false
                  );
                }}
                autoFocus
                placeholder="Write section content..."
                style={{
                  width: "100%",
                  minHeight: "140px",
                  padding: "10px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "6px",
                  resize: "vertical",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              />
            </>
          ) : (
            <div
              onClick={() =>
                setEditingContent(
                  true
                )
              }
              style={{
                padding: "10px",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "6px",
                background:
                  "#fafafa",
                cursor: "text",
                minHeight: "60px",
              }}
            >
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
              >
                  {content}
              </ReactMarkdown>
              ) : (
                <span
                  style={{
                    color:
                      "#9ca3af",
                  }}
                >
                  Click to add content...
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CHILDREN */}
      {expanded &&
        section.children?.map(
          (child) => (
            <SectionNode
              key={child._id}
              section={child}
              depth={depth + 1}
              onAddChild={
                onAddChild
              }
              onDelete={onDelete}
            />
          )
        )}
    </div>
  );
}