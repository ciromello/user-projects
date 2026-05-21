import React, {
  useEffect,
  useState,
} from "react";

import SectionNode from "./SectionNode";

import {
  DndContext,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// =========================
// ROOT DROP ZONE
// =========================
function RootDropZone() {
  const { setNodeRef, isOver } =
    useDroppable({
      id: "ROOT_DROP",
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: "12px",
        marginBottom: "16px",
        border: "2px dashed #cbd5e1",
        borderRadius: "8px",
        background: isOver
          ? "#dbeafe"
          : "#f8fafc",
        textAlign: "center",
        fontSize: "14px",
      }}
    >
      ⬆ Drop Here To Move Section To Root
    </div>
  );
}

export default function SectionTree({
  documentId,
}) {
  const [structure, setStructure] =
    useState([]);

  // =========================
  // DOCUMENT TITLE
  // =========================
  const [
    documentTitle,
    setDocumentTitle,
  ] = useState(
    "📄 Recursive Document Tree"
  );

  // =========================
  // LOAD TREE
  // =========================
  async function loadTree() {
    const res = await fetch(
      `http://localhost:3000/sections/document/${documentId}/structure`
    );

    const data = await res.json();

    setStructure(data.structure || []);
  }

  useEffect(() => {
    loadTree();
  }, [documentId]);

  // =========================
  // CREATE CHILD SECTION
  // =========================
  async function createChild(
    parentId
  ) {
    await fetch(
      "http://localhost:3000/sections",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          documentId,
          title: "New Section",
          content: "New section",
          parentSectionId:
            parentId,
          order: 1,
        }),
      }
    );

    await loadTree();
  }

  // =========================
  // CREATE ROOT SECTION
  // =========================
  async function createRootSection() {
    await fetch(
      "http://localhost:3000/sections",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          documentId,
          title:
            "New Root Section",
          content:
            "New root section",
          parentSectionId: null,
          order:
            structure.length + 1,
        }),
      }
    );

    await loadTree();
  }

  // =========================
  // DELETE SECTION
  // =========================
  async function deleteSection(
    sectionId
  ) {
    await fetch(
      `http://localhost:3000/sections/${sectionId}`,
      {
        method: "DELETE",
      }
    );

    await loadTree();
  }

  // =========================
  // MOVE SECTION
  // =========================
  async function moveSection(
    sectionId,
    newParentSectionId,
    newOrder = 1
  ) {
    await fetch(
      `http://localhost:3000/sections/${sectionId}/move`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          newParentSectionId,
          newOrder,
        }),
      }
    );

    await loadTree();
  }

  // =========================
  // FLATTEN TREE
  // =========================
  function flattenTree(nodes) {
    let result = [];

    for (const node of nodes) {
      result.push(node);

      if (node.children?.length) {
        result = result.concat(
          flattenTree(
            node.children
          )
        );
      }
    }

    return result;
  }

  const flatStructure =
    flattenTree(structure);

  // =========================
  // FIND PARENT
  // =========================
  function findParentId(
    nodes,
    id,
    parentId = null
  ) {
    for (const node of nodes) {
      if (node._id === id) {
        return parentId;
      }

      if (node.children?.length) {
        const result =
          findParentId(
            node.children,
            id,
            node._id
          );

        if (
          result !== undefined
        ) {
          return result;
        }
      }
    }

    return undefined;
  }

  // =========================
  // DRAG END
  // =========================
  async function handleDragEnd(
    event
  ) {
    const { active, over } =
      event;

    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }

    const draggedId =
      active.id;

    const targetId = over.id;

    // =========================
    // ROOT DROP
    // =========================
    if (
      targetId === "ROOT_DROP"
    ) {
      await moveSection(
        draggedId,
        null,
        structure.length + 1
      );

      await loadTree();

      return;
    }

    // =========================
    // FIND PARENTS
    // =========================
    const draggedParentId =
      findParentId(
        structure,
        draggedId
      );

    const targetParentId =
      findParentId(
        structure,
        targetId
      );

    // =========================
    // SAME PARENT = REORDER
    // =========================
    if (
      draggedParentId ===
      targetParentId
    ) {
      const siblings =
        flatStructure.filter(
          (s) =>
            findParentId(
              structure,
              s._id
            ) ===
            draggedParentId
        );

      const targetIndex =
        siblings.findIndex(
          (s) =>
            s._id === targetId
        );

      await moveSection(
        draggedId,
        draggedParentId,
        targetIndex + 1
      );

      await loadTree();

      return;
    }

    // =========================
    // DIFFERENT PARENT
    // =========================
    await moveSection(
      draggedId,
      targetId,
      1
    );

    await loadTree();
  }

  return (
    <div style={{ padding: 16 }}>
      {/* DOCUMENT TITLE */}
      <input
        value={documentTitle}
        onChange={(e) =>
          setDocumentTitle(
            e.target.value
          )
        }
        onPointerDown={(e) =>
          e.stopPropagation()
        }
        style={{
          fontSize: "28px",
          fontWeight: "700",
          border: "none",
          outline: "none",
          width: "100%",
          marginBottom: "16px",
          background: "transparent",
        }}
      />

      <RootDropZone />

      {/* ROOT BUTTON */}
      <div
        style={{
          marginBottom: 12,
        }}
      >
        <button
          onClick={
            createRootSection
          }
          style={{
            padding: "6px 10px",
            border:
              "1px solid #ddd",
            borderRadius: "6px",
            cursor: "pointer",
            background:
              "#f9fafb",
          }}
        >
          + Root Section
        </button>
      </div>

      {/* DND AREA */}
      <DndContext
        collisionDetection={
          closestCenter
        }
        onDragEnd={
          handleDragEnd
        }
      >
        <SortableContext
          items={flatStructure.map(
            (s) => s._id
          )}
          strategy={
            verticalListSortingStrategy
          }
        >
          {structure.map(
            (section) => (
              <SectionNode
                key={section._id}
                section={section}
                depth={0}
                onAddChild={
                  createChild
                }
                onDelete={
                  deleteSection
                }
                onMove={
                  moveSection
                }
              />
            )
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
}