import React from "react";

const THUMB_SIZE = 90;

const ImagePreviewGrid = ({ files, onRemove, primaryLabel }) => {
  const [urls, setUrls] = React.useState([]);

  React.useEffect(() => {
    const nextUrls = (files || []).map((file) => URL.createObjectURL(file));
    setUrls(nextUrls);
    return () => nextUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="d-flex flex-wrap mt-2" style={{ gap: 8 }}>
      {files.map((file, index) => (
        <div key={`${file.name}-${index}`} style={{ position: "relative", width: THUMB_SIZE }}>
          <img
            src={urls[index]}
            alt={file.name}
            style={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              objectFit: "cover",
              borderRadius: 4,
              border: "1px solid #d9d9d9",
              display: "block",
            }}
          />
          {primaryLabel && index === 0 && (
            <span
              style={{
                position: "absolute",
                bottom: 2,
                left: 2,
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: 10,
                padding: "1px 4px",
                borderRadius: 2,
              }}
            >
              {primaryLabel}
            </span>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label="Remove image"
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#dc3545",
                color: "#fff",
                border: "none",
                lineHeight: "18px",
                fontSize: 12,
                padding: 0,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImagePreviewGrid;
