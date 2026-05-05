import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/**
 * Individual draggable section item
 */
function SortableItem({ section }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px",
    marginBottom: "8px",
    background: "#f3f3f3",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      📄 {section.title}
    </div>
  );
}

/**
 * Main Section List Component
 */
export default function SectionList({ documentId }) {
  const [sections, setSections] = useState([]);

  // Enables drag detection
  const sensors = useSensors(useSensor(PointerSensor));

  /**
   * Load sections from backend
   */
  useEffect(() => {
    if (!documentId) return;

    fetch(`http://localhost:3000/sections/${documentId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("SECTIONS LOADED:", data);
        setSections(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [documentId]);

  /**
   * Handle drag & drop reorder
   */
  async function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s._id === active.id);
    const newIndex = sections.findIndex((s) => s._id === over.id);

    const newList = arrayMove(sections, oldIndex, newIndex);
    setSections(newList);

    const movedItem = newList[newIndex];

    // Sync with backend
    await fetch(`http://localhost:3000/sections/${movedItem._id}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newOrder: newIndex + 1,
        newParentSectionId: null,
      }),
    });
  }

  return (
    <div style={{ padding: "10px" }}>
  

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s._id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SortableItem key={section._id} section={section} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
console.log("DOCUMENT ID:", documentId);
console.log("SECTIONS STATE:", sections);
}

