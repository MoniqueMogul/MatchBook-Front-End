"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  DragEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import {
  FileImage,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import "./ProfileImageModal.css";

interface ProfileImageModalProps {
  isOpen: boolean;
  imageSrc?: string;
  onClose: () => void;
  onDone: (imageSrc: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

const PREVIEW_WIDTH = 378;
const PREVIEW_HEIGHT = 294;
const CROP_SIZE = 190;
const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

interface Point {
  x: number;
  y: number;
}

export default function ProfileImageModal({
  isOpen,
  imageSrc,
  onClose,
  onDone,
}: ProfileImageModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [draftSrc, setDraftSrc] = useState<string | undefined>(imageSrc);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] =
    useState({ width: 0, height: 0 });
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setDraftSrc(imageSrc);
    setSelectedFile(null);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    setImageDimensions({ width: 0, height: 0 });
    setError("");
    setIsProcessing(false);
  }, [isOpen, imageSrc]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isProcessing) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isProcessing, onClose]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFile = useCallback((file?: File) => {
    if (!file) return;

    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("Please select a PNG or JPG image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be 10MB or smaller.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setSelectedFile(file);
    setDraftSrc(objectUrl);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    setImageDimensions({ width: 0, height: 0 });
    setError("");
  }, []);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleImageLoad = (
    event: React.SyntheticEvent<HTMLImageElement>,
  ) => {
    setImageDimensions({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    });
    setOffset({ x: 0, y: 0 });
  };

  const getRenderedImageSize = useCallback(() => {
    if (!imageDimensions.width || !imageDimensions.height) {
      return null;
    }

    const baseScale = Math.max(
      PREVIEW_WIDTH / imageDimensions.width,
      PREVIEW_HEIGHT / imageDimensions.height,
    );

    return {
      width: imageDimensions.width * baseScale * zoom,
      height: imageDimensions.height * baseScale * zoom,
      baseScale,
    };
  }, [imageDimensions, zoom]);

  const clampOffset = useCallback(
    (point: Point): Point => {
      const rendered = getRenderedImageSize();

      if (!rendered) return { x: 0, y: 0 };

      const horizontalLimit = Math.max(
        0,
        (rendered.width - CROP_SIZE) / 2,
      );
      const verticalLimit = Math.max(
        0,
        (rendered.height - CROP_SIZE) / 2,
      );

      return {
        x: Math.min(
          horizontalLimit,
          Math.max(-horizontalLimit, point.x),
        ),
        y: Math.min(
          verticalLimit,
          Math.max(-verticalLimit, point.y),
        ),
      };
    },
    [getRenderedImageSize],
  );

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!draftSrc || isProcessing) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const drag = dragRef.current;

    if (
      !drag ||
      drag.pointerId !== event.pointerId ||
      !draftSrc ||
      isProcessing
    ) {
      return;
    }

    const next = clampOffset({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });

    setOffset(next);
  };

  const handlePointerUp = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const handleZoomChange = (value: number) => {
    const previousZoom = zoom;
    const nextZoom = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, value),
    );

    if (nextZoom === previousZoom) return;

    const ratio = nextZoom / previousZoom;

    setOffset((current) =>
      clampOffset({
        x: current.x * ratio,
        y: current.y * ratio,
      }),
    );

    setZoom(nextZoom);
  };

  const handleRemove = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setDraftSrc(undefined);
    setSelectedFile(null);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    setImageDimensions({ width: 0, height: 0 });
    setError("");
  };

  const handleDone = async () => {
    if (!draftSrc || isProcessing) return;

    setIsProcessing(true);
    setError("");

    try {
      const croppedImage = await createCroppedImage({
        src: draftSrc,
        naturalWidth: imageDimensions.width,
        naturalHeight: imageDimensions.height,
        zoom,
        offset,
      });

      onDone(croppedImage);
    } catch {
      setError(
        "We couldn't process this image. Please try another one.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const rendered = getRenderedImageSize();

  const imageStyle = rendered
    ? {
        width: rendered.width,
        height: rendered.height,
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
      }
    : undefined;

  return (
    <div
      className="profile-image-modal__backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isProcessing
        ) {
          onClose();
        }
      }}
    >
      <section
        className="profile-image-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-image-modal-title"
        aria-describedby="profile-image-modal-description"
      >
        <div className="profile-image-modal__header">
          <h2 id="profile-image-modal-title">
            Select A Profile Image
          </h2>

          <button
            type="button"
            className="profile-image-modal__close"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close"
          >
            <X size={22} strokeWidth={1.6} />
          </button>
        </div>

        <p
          id="profile-image-modal-description"
          className="profile-image-modal__sr-only"
        >
          Upload a PNG or JPG image, position it inside the
          circular crop area, and adjust the zoom before selecting
          Done.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="profile-image-modal__file-input"
          onChange={handleInputChange}
        />

        {draftSrc ? (
          <>
            <div className="profile-image-modal__file-row">
              <button
                type="button"
                className="profile-image-modal__change-button"
                onClick={openFilePicker}
                disabled={isProcessing}
              >
                Select a different image
              </button>

              <div className="profile-image-modal__file">
                <FileImage size={16} strokeWidth={1.5} />

                <div className="profile-image-modal__file-info">
                  <span className="profile-image-modal__file-name">
                    {selectedFile?.name || "image.png"}
                  </span>

                  <span className="profile-image-modal__file-size">
                    {selectedFile
                      ? formatFileSize(selectedFile.size)
                      : "Existing image"}
                  </span>
                </div>

                <button
                  type="button"
                  className="profile-image-modal__file-remove"
                  onClick={handleRemove}
                  disabled={isProcessing}
                  aria-label="Remove selected image"
                >
                  <X size={14} strokeWidth={1.6} />
                </button>
              </div>
            </div>

            <div
              ref={previewRef}
              className="profile-image-modal__preview"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onLostPointerCapture={handlePointerUp}
            >
              <img
                src={draftSrc}
                alt="Profile image to crop"
                className="profile-image-modal__preview-image"
                style={imageStyle}
                onLoad={handleImageLoad}
                draggable={false}
              />

              <div
                className="profile-image-modal__crop-circle"
                aria-hidden="true"
              />
            </div>

            <div className="profile-image-modal__zoom-row">
              <button
                type="button"
                className="profile-image-modal__zoom-icon"
                onClick={() =>
                  handleZoomChange(zoom - 0.1)
                }
                disabled={isProcessing || zoom <= MIN_ZOOM}
                aria-label="Zoom out"
              >
                <ImageIcon size={15} strokeWidth={1.5} />
              </button>

              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step="0.05"
                value={zoom}
                onChange={(event) =>
                  handleZoomChange(Number(event.target.value))
                }
                className="profile-image-modal__zoom-slider"
                aria-label="Image zoom"
                disabled={isProcessing}
              />

              <button
                type="button"
                className="profile-image-modal__zoom-icon"
                onClick={() =>
                  handleZoomChange(zoom + 0.1)
                }
                disabled={
                  isProcessing || zoom >= MAX_ZOOM
                }
                aria-label="Zoom in"
              >
                <ImageIcon size={15} strokeWidth={1.5} />
              </button>
            </div>
          </>
        ) : (
          <div
            className="profile-image-modal__upload-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            onClick={openFilePicker}
            role="button"
            tabIndex={0}
            aria-label="Upload profile image"
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                openFilePicker();
              }
            }}
          >
            <Upload size={18} strokeWidth={1.4} />

            <span className="profile-image-modal__upload-title">
              Click to upload or drag and drop
            </span>

            <span className="profile-image-modal__upload-hint">
              PNG or JPG up to 10MB
            </span>
          </div>
        )}

        {error && (
          <p className="profile-image-modal__error" role="alert">
            {error}
          </p>
        )}

        <div className="profile-image-modal__actions">
          <button
            type="button"
            className="profile-image-modal__button profile-image-modal__button--cancel"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>

          <button
            type="button"
            className="profile-image-modal__button profile-image-modal__button--done"
            onClick={handleDone}
            disabled={!draftSrc || isProcessing}
          >
            {isProcessing ? "Saving..." : "Done"}
          </button>
        </div>
      </section>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function createCroppedImage({
  src,
  naturalWidth,
  naturalHeight,
  zoom,
  offset,
}: {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
  offset: Point;
}): Promise<string> {
  if (!naturalWidth || !naturalHeight) {
    throw new Error("Image dimensions are unavailable.");
  }

  const image = await loadImage(src);

  const baseScale = Math.max(
    PREVIEW_WIDTH / naturalWidth,
    PREVIEW_HEIGHT / naturalHeight,
  );

  const displayedScale = baseScale * zoom;

  const renderedWidth = naturalWidth * displayedScale;
  const renderedHeight = naturalHeight * displayedScale;

  const imageLeft =
    (PREVIEW_WIDTH - renderedWidth) / 2 + offset.x;
  const imageTop =
    (PREVIEW_HEIGHT - renderedHeight) / 2 + offset.y;

  const cropLeft =
    (PREVIEW_WIDTH - CROP_SIZE) / 2;
  const cropTop =
    (PREVIEW_HEIGHT - CROP_SIZE) / 2;

  const sourceX =
    (cropLeft - imageLeft) / displayedScale;
  const sourceY =
    (cropTop - imageTop) / displayedScale;

  const sourceSize = CROP_SIZE / displayedScale;

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Unable to load image."));

    image.src = src;
  });
}
