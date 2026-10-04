"use client";

import { useMemo, useState } from "react";
import "./CoverImageModal.css";

export interface CoverImageOption {
  id: string;
  url: string;
  alt: string;
}

interface CoverImageModalProps {
  open: boolean;
  currentImage?: string;
  images: CoverImageOption[];
  onClose: () => void;
  onDone: (imageUrl: string) => void;
}

export default function CoverImageModal({
  open,
  currentImage,
  images,
  onClose,
  onDone,
}: CoverImageModalProps) {
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(
    currentImage ?? ""
  );

  /*
   * Keep the modal selection separate from the actual
   * BusinessEditor form state.
   *
   * Therefore clicking an image does NOT immediately
   * change the business cover image.
   */
  const filteredImages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return images;
    }

    return images.filter((image) =>
      image.alt.toLowerCase().includes(query)
    );
  }, [images, search]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    setSearch("");
    setSelectedImage(currentImage ?? "");
    onClose();
  };

  const handleDone = () => {
    if (!selectedImage) {
      return;
    }

    setSearch("");
    onDone(selectedImage);
  };

  return (
    <div
      className="cover-image-modal__overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="cover-image-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cover-image-modal-title"
      >
        <div className="cover-image-modal__header">
          <h2 id="cover-image-modal-title">
            Select A Cover Image
          </h2>

          <button
            type="button"
            className="cover-image-modal__close"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="cover-image-modal__search">
          <span className="cover-image-modal__search-icon">
            ⌕
          </span>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search"
            aria-label="Search cover images"
          />

          <span className="cover-image-modal__shortcut">
            ⌘K
          </span>
        </div>

        <div className="cover-image-modal__grid">
          {filteredImages.map((image) => {
            const isSelected =
              selectedImage === image.url;

            return (
              <button
                key={image.id}
                type="button"
                className={`cover-image-modal__option ${
                  isSelected
                    ? "cover-image-modal__option--selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedImage(image.url)
                }
                aria-label={`Select ${image.alt}`}
              >
                <span
                  className={`cover-image-modal__radio ${
                    isSelected
                      ? "cover-image-modal__radio--selected"
                      : ""
                  }`}
                >
                  {isSelected && (
                    <span className="cover-image-modal__radio-dot" />
                  )}
                </span>

                <img
                  src={image.url}
                  alt={image.alt}
                  className="cover-image-modal__image"
                />
              </button>
            );
          })}

          {filteredImages.length === 0 && (
            <div className="cover-image-modal__empty">
              No cover images found.
            </div>
          )}
        </div>

        <div className="cover-image-modal__footer">
          <button
            type="button"
            className="cover-image-modal__cancel"
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="cover-image-modal__done"
            disabled={!selectedImage}
            onClick={handleDone}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}