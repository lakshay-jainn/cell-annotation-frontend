import { useEffect, useRef, useState, useCallback } from "react";

/**
 * FreehandAnnotator - True freehand drawing mode
 * Allows users to draw multiple freehand cells.
 * Each stroke becomes a separate polygon (cell).
 *
 * The key insight: Canvas rendering must happen at display resolution
 * with zoom/pan applied during rendering, NOT via CSS transforms.
 * This keeps mouse coordinate mapping simple and direct.
 */

export default function FreehandAnnotator({
  imgSrc,
  onSubmit,
  simplifyEpsilon = 3,
  getTransform,
  containerRef: parentContainerRef,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const imageLoadingRef = useRef(false);
  const strokesRef = useRef([]); // Strokes stored in IMAGE coordinates
  const currentStrokeRef = useRef([]); // Current stroke in IMAGE coordinates
  const isDrawingRef = useRef(false);
  const animationFrameRef = useRef(null);

  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Redraw canvas with zoom/pan applied
  const redrawAll = useCallback(
    (allStrokes, currentDrawing) => {
      const canvas = canvasRef.current;
      if (!canvas || !imageRef.current) return;
      const ctx = canvas.getContext("2d");

      // Get current transform
      const transform = getTransform
        ? getTransform()
        : { offsetX: 0, offsetY: 0, scale: 1 };

      // CRITICAL: Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transform to canvas context (NOT via CSS)
      ctx.save();
      ctx.translate(transform.offsetX, transform.offsetY);
      ctx.scale(transform.scale, transform.scale);

      // Draw completed strokes (stored in image coordinates)
      allStrokes.forEach((stroke, idx) => {
        if (stroke.length < 2) return;
        ctx.strokeStyle = "#ff6b6b";
        ctx.lineWidth = 2; // In image coordinate space
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.fillStyle = "rgba(255, 107, 107, 0.2)";
        ctx.beginPath();
        ctx.moveTo(stroke[0][0], stroke[0][1]);
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i][0], stroke[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw cell number
        if (stroke.length > 0) {
          const centerX =
            stroke.reduce((sum, p) => sum + p[0], 0) / stroke.length;
          const centerY =
            stroke.reduce((sum, p) => sum + p[1], 0) / stroke.length;
          ctx.fillStyle = "#ff6b6b";
          ctx.font = "bold 14px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(idx + 1, centerX, centerY);
        }
      });

      // Draw current stroke in progress
      if (currentDrawing.length >= 2) {
        ctx.strokeStyle = "#ffb86c";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(currentDrawing[0][0], currentDrawing[0][1]);
        for (let i = 1; i < currentDrawing.length; i++) {
          ctx.lineTo(currentDrawing[i][0], currentDrawing[i][1]);
        }
        ctx.stroke();
      }

      ctx.restore();
    },
    [getTransform]
  );

  // Load image and setup canvas
  useEffect(() => {
    if (imageLoadingRef.current) return;
    imageLoadingRef.current = true;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas && parentContainerRef?.current) {
        // Set canvas to match DISPLAY size (container size)
        const rect = parentContainerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        // Initial redraw
        redrawAll([], []);
      }
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load image");
      imageLoadingRef.current = false;
    };
    img.src = imgSrc;
  }, [imgSrc, redrawAll, parentContainerRef]);
  // Convert mouse/display coordinates to image coordinates
  const getImageCoords = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas || !imageRef.current) return null;

      // Get canvas bounds (canvas fills container exactly)
      const rect = canvas.getBoundingClientRect();
      const displayX = e.clientX - rect.left;
      const displayY = e.clientY - rect.top;

      // Get current transform
      const transform = getTransform
        ? getTransform()
        : { offsetX: 0, offsetY: 0, scale: 1, dispW: 0, dispH: 0 };

      // The canvas context applies: translate(offsetX, offsetY) then scale(scale, scale)
      // So the inverse transform is:
      // displayCoord = offsetX + imageCoord * scale
      // imageCoord = (displayCoord - offsetX) / scale

      const imgX = (displayX - transform.offsetX) / transform.scale;
      const imgY = (displayY - transform.offsetY) / transform.scale;

      // Bounds check: ensure we're within the actual image bounds
      if (
        imgX < 0 ||
        imgY < 0 ||
        imgX > imageRef.current.width ||
        imgY > imageRef.current.height
      ) {
        return null;
      }

      return [imgX, imgY];
    },
    [getTransform]
  );

  // Start drawing
  const handleMouseDown = useCallback(
    (e) => {
      isDrawingRef.current = true;
      const coords = getImageCoords(e);
      if (coords) {
        currentStrokeRef.current = [coords];
        setCurrentStroke([coords]);
      }
    },
    [getImageCoords]
  );

  // Continue drawing
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDrawingRef.current) return;

      const coords = getImageCoords(e);
      if (!coords) return;

      currentStrokeRef.current.push(coords);
      setCurrentStroke((prev) => [...prev, coords]);

      // Redraw on next frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        redrawAll(strokesRef.current, currentStrokeRef.current);
      });
    },
    [getImageCoords, redrawAll]
  );

  // Finish stroke
  const handleMouseUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (currentStrokeRef.current.length >= 3) {
      strokesRef.current.push(currentStrokeRef.current);
      setStrokes((prev) => [...prev, currentStrokeRef.current]);
      currentStrokeRef.current = [];
      setCurrentStroke([]);
      redrawAll(strokesRef.current, []);
    } else {
      currentStrokeRef.current = [];
      setCurrentStroke([]);
      redrawAll(strokesRef.current, []);
    }
  }, [redrawAll]);

  // Simplify polygon using Ramer-Douglas-Peucker algorithm
  const simplifyPolygon = useCallback((polygon, epsilon = 3) => {
    if (polygon.length <= 2) return polygon;

    const dmax = (p, line) => {
      const [x0, y0] = line[0];
      const [x1, y1] = line[1];
      const num = Math.abs(
        (y1 - y0) * p[0] - (x1 - x0) * p[1] + x1 * y0 - y1 * x0
      );
      const den = Math.sqrt((y1 - y0) ** 2 + (x1 - x0) ** 2);
      return num / den;
    };

    const rdp = (pts, eps) => {
      let maxDist = 0;
      let maxIdx = 0;
      const first = pts[0];
      const last = pts[pts.length - 1];

      for (let i = 1; i < pts.length - 1; i++) {
        const dist = dmax(pts[i], [first, last]);
        if (dist > maxDist) {
          maxDist = dist;
          maxIdx = i;
        }
      }

      if (maxDist > eps) {
        const left = rdp(pts.slice(0, maxIdx + 1), eps);
        const right = rdp(pts.slice(maxIdx), eps);
        return [...left.slice(0, -1), ...right];
      } else {
        return [first, last];
      }
    };

    return rdp(polygon, epsilon);
  }, []);

  // Undo last stroke/cell
  const handleUndo = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current.pop();
    setStrokes((prev) => prev.slice(0, -1));
    redrawAll(strokesRef.current, []);
  }, [redrawAll]);

  // Clear all strokes
  const handleClear = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    setStrokes([]);
    setCurrentStroke([]);
    redrawAll([], []);
  }, [redrawAll]);

  // Submit all cells (each stroke is a separate polygon)
  const handleSubmit = useCallback(() => {
    if (strokesRef.current.length === 0) {
      alert("Please draw at least one cell.");
      return;
    }

    const polygons = strokesRef.current.map((stroke) => {
      const simplified = simplifyPolygon(stroke, simplifyEpsilon);

      const coords =
        simplified[0][0] === simplified[simplified.length - 1][0] &&
        simplified[0][1] === simplified[simplified.length - 1][1]
          ? simplified
          : [...simplified, simplified[0]];

      return {
        type: "Polygon",
        coordinates: [coords],
      };
    });

    polygons.forEach((polygon, idx) => {
      onSubmit(polygon, {
        cellNumber: idx + 1,
        totalCells: polygons.length,
        pointCount: polygon.coordinates[0].length,
      });
    });

    handleClear();
  }, [simplifyPolygon, simplifyEpsilon, onSubmit, handleClear]);

  return (
    <div className="absolute inset-0 z-40" style={{ overflow: "hidden" }}>
      {/* Canvas - positioned and sized to match image display area exactly */}
      {imageLoaded && imageRef.current && (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute cursor-crosshair"
          style={{
            display: "block",
            pointerEvents: "auto",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          }}
        />
      )}
      {!imageLoaded && (
        <div className="flex items-center justify-center h-full bg-gray-900 bg-opacity-50">
          <p className="text-white text-sm">Loading drawing canvas...</p>
        </div>
      )}

      {/* Controls Toolbar */}
      <div className="bg-white bg-opacity-95 border-t border-gray-300 p-3 flex gap-2 flex-wrap items-center absolute bottom-0 left-0 right-0 z-50">
        <div className="text-xs text-gray-600 flex-1">
          <p className="font-semibold">Cells: {strokes.length}</p>
          {strokes.length > 0 && (
            <p className="text-green-600">✓ Draw more cells or submit</p>
          )}
          {strokes.length === 0 && (
            <p className="text-amber-600">
              Drag to draw cells (one per stroke)
            </p>
          )}
        </div>

        <button
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Undo Cell
        </button>

        <button
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </button>

        <button
          onClick={handleSubmit}
          disabled={strokes.length === 0}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          Submit {strokes.length > 0 ? `(${strokes.length} Cells)` : ""}
        </button>

        <span className="text-xs text-gray-500">
          Each stroke = 1 cell. Release to finish cell.
        </span>
      </div>
    </div>
  );
}
