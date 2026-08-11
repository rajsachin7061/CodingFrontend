/* eslint-disable react/prop-types */
import { useState } from "react";

export default function DragReorderList({ items, onReorder, renderItem, keyField = "id" }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const handleDrop = () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(overIndex, 0, moved);
    onReorder(next);
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          draggable
          key={item[keyField]}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setOverIndex(index);
          }}
          onDragStart={() => setDragIndex(index)}
          onDrop={handleDrop}
          className={`rounded-xl border bg-white transition ${
            overIndex === index && dragIndex !== index
              ? "border-indigo-400 shadow-md"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3 p-3">
            <span
              aria-hidden="true"
              className="cursor-grab select-none px-1 text-slate-400 active:cursor-grabbing"
              title="Drag to reorder"
            >
              ⠿
            </span>
            <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
