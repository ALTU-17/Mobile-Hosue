"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { imageFileName } from "@/lib/images";

type Upload = {
  preview: string;
  fileName: string;
  size: number;
};

type ImageFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called with the real pixel size once the image loads. */
  onDimensions?: (width: number, height: number) => void;
  nameHint?: string;
  label?: string;
};

export function ImageField({
  value,
  onChange,
  onDimensions,
  nameHint,
  label = "Image",
}: ImageFieldProps) {
  const [upload, setUpload] = useState<Upload | null>(null);
  const [broken, setBroken] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Free the blob URL when the upload is replaced or the panel closes. */
  useEffect(() => {
    return () => {
      if (upload) URL.revokeObjectURL(upload.preview);
    };
  }, [upload]);

  const source = upload?.preview ?? value.trim();
  const hint = upload
    ? `Save the download as public/images/uploads/${upload.fileName} — the path in the JSON is already set.`
    : "Paste an https URL to keep images off your database, or upload a file and save it into public/images/uploads/.";

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("That file is not an image.");
      return;
    }

    const extension =
      (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const fileName = `${imageFileName(nameHint || file.name, "photo")}-${Date.now()
      .toString(36)}.${extension}`;

    const preview = URL.createObjectURL(file);
    setUpload({ preview, fileName, size: file.size });
    setBroken(false);
    onChange(`/images/uploads/${fileName}`);

    /* Report the real pixel size so a poster keeps its proportions. */
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalWidth > 0 && probe.naturalHeight > 0) {
        onDimensions?.(probe.naturalWidth, probe.naturalHeight);
      }
    };
    probe.src = preview;

    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="image-field">
      <div className="image-field__head">
        <span className="admin-field__label">{label}</span>
        <span className="image-field__mode">
          {upload
            ? `uploaded · ${Math.round(upload.size / 1024)} KB`
            : value.trim()
              ? "from URL/path"
              : "no image"}
        </span>
      </div>

      <div className="image-field__body">
        <div className="image-field__preview">
          {source && !broken ? (
            <img
              src={source}
              alt=""
              onLoad={(event) => {
                const element = event.currentTarget;
                if (element.naturalWidth > 0) {
                  onDimensions?.(element.naturalWidth, element.naturalHeight);
                }
              }}
              onError={() => setBroken(true)}
            />
          ) : (
            <span>{broken ? "Image not found yet" : "No image"}</span>
          )}
        </div>

        <div className="image-field__controls">
          <input
            className="admin-input"
            type="text"
            value={value}
            spellCheck={false}
            placeholder="https://… or /images/festival/poster.webp"
            onChange={(event) => {
              setBroken(false);
              setUpload(null);
              onChange(event.target.value);
            }}
          />

          <div className="image-field__actions">
            <button
              type="button"
              className="admin-btn admin-btn--small"
              onClick={() => fileRef.current?.click()}
            >
              Upload image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => handleFile(event.target.files?.[0])}
            />

            {upload && (
              <a
                className="admin-btn admin-btn--small admin-btn--primary"
                href={upload.preview}
                download={upload.fileName}
              >
                Download image
              </a>
            )}

            {value && (
              <button
                type="button"
                className="admin-btn admin-btn--small admin-btn--ghost"
                onClick={() => {
                  setUpload(null);
                  setBroken(false);
                  onChange("");
                }}
              >
                Clear
              </button>
            )}
          </div>

          <p className="image-field__hint">{hint}</p>
        </div>
      </div>
    </div>
  );
}
