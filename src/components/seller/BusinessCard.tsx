"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Globe, Trash2, Upload } from "lucide-react";
import type { Business } from "@/types/seller";
import "./BusinessCard.css";

interface BusinessCardProps {
  business: Business;
  onView: (id: string) => void;
  onUnlist: (id: string) => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BusinessCard({
  business,
  onView,
  onUnlist,
  onPublish,
  onDelete,
}: BusinessCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isDraft = business.status === "draft";

  return (
    <div className="business-card" onClick={() => onView(business.id)}>
      <div className="business-card__image">
        {business.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.image_url} alt={business.name} />
        ) : (
          <div className="business-card__image-placeholder" />
        )}

        <span className={`business-card__status business-card__status--${business.status}`}>
          {isDraft ? "Draft" : "Active"}
        </span>

        <div className="business-card__menu-wrap" ref={menuRef}>
          <button
            className="business-card__menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            aria-label="More actions"
          >
            <MoreVertical size={16} strokeWidth={2} />
          </button>

          {menuOpen && (
            <div className="business-card__menu" onClick={(e) => e.stopPropagation()}>
              {isDraft ? (
                <button
                  className="business-card__menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onPublish(business.id);
                  }}
                >
                  <Upload size={14} strokeWidth={1.8} />
                  Publish
                </button>
              ) : (
                <button
                  className="business-card__menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onUnlist(business.id);
                  }}
                >
                  <Globe size={14} strokeWidth={1.8} />
                  Unlist
                </button>
              )}
              <button
                className="business-card__menu-item business-card__menu-item--danger"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(business.id);
                }}
              >
                <Trash2 size={14} strokeWidth={1.8} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="business-card__body">
        <div className="business-card__label">INDUSTRY NAME</div>
        <div className="business-card__name">{business.name}</div>
        <div className="business-card__desc">
          {business.description || "Short description of the business."}
        </div>
        <div className="business-card__location">
          📍 {business.city}, {business.state}
        </div>

        {isDraft && (
          <div className="business-card__progress">
            <div className="business-card__progress-label">
              {business.completion_percent}% Complete
            </div>
            <div className="business-card__progress-bar">
              <div
                className="business-card__progress-fill"
                style={{ width: `${business.completion_percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}