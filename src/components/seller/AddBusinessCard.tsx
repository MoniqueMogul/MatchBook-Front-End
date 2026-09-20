"use client";

import { Plus } from "lucide-react";
import "./AddBusinessCard.css";

interface AddBusinessCardProps {
  onClick: () => void;
}

export default function AddBusinessCard({ onClick }: AddBusinessCardProps) {
  return (
    <button className="add-business-card" onClick={onClick}>
      <div className="add-business-card__icon">
        <Plus size={28} strokeWidth={1.8} />
      </div>
      <div className="add-business-card__title">List another business</div>
      <div className="add-business-card__desc">
        Add another business, and keep its buyer conversations separate.
      </div>
    </button>
  );
}