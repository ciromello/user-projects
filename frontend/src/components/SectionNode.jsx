import React, { useState } from "react";

import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

export default function SectionNode({
  section,
  depth = 0,
  onAddChild,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(true);

  const [title, setTitle] = useState(
    section.title
  );

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
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // =========================
  // SAVE TITLE
  // =========================
  async function saveTitle() {
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
  }

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
          depth > 0 ? "12px" : "0px",
      }}
    >
      {/* NODE */}
      <div
        {...attributes}
        {...listeners}
        style={{
          padding: "8px",
          marginBottom: "6px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          cursor: "grab",
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
          {/* EXPAND */}
          {hasChildren ? (
            <button
              onClick={() =>
                setExpanded(!expanded)
              }
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "12px",
                width: "18px",
              }}
            >
              {expanded ? "▼" : "▶"}
            </button>
          ) : (
            <span style={{ width: "18px" }}>
              └
            </span>
          )}

          {/* TITLE */}
          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            onBlur={saveTitle}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "14px",
              width: "100%",
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
              onAddChild(section._id)
            }
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
              background: "#f9fafb",
            }}
          >
            + Child
          </button>

          {/* DELETE */}
          <button
            onClick={handleDelete}
            style={{
              border: "1px solid #fecaca",
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
              background: "#fef2f2",
              color: "#dc2626",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* CHILDREN */}
      {expanded &&
        section.children?.map((child) => (
          <SectionNode
            key={child._id}
            section={child}
            depth={depth + 1}
            onAddChild={onAddChild}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}