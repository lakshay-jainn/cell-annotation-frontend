import { useEffect, useRef, useState, useCallback } from "react";

/**
 * FreehandAnnotator - True freehand drawing mode
 * Allows users to draw multiple freehand cells.
 * Each stroke becomes a separate polygon (cell).
 *
 * Props:
 *   - imgSrc: URL or data URL of the image
 *   - onSubmit: callback(geojson, metadata) when user submits drawing
 *   - simplifyEpsilon: line simplification epsilon (default: 3)
 *   - getTransform: function to get current zoom/pan transform
 *   - containerRef: ref to container for coordinate mapping
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
  const strokesRef = useRef([]); // Use ref for strokes to avoid stale closures
  const currentStrokeRef = useRef([]); // Use ref for current stroke
  const isDrawingRef = useRef(false);
  const animationFrameRef = useRef(null);

  const [strokes, setStrokes] = useState([]); // For UI updates only
  const [currentStroke, setCurrentStroke] = useState([]); // For UI updates only
  const [imageLoaded, setImageLoaded] = useState(false); // Track image loading state

  // Redraw entire canvas
  const redrawAll = useCallback((allStrokes, currentDrawing) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!imageRef.current) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    // Draw completed strokes
    allStrokes.forEach((stroke, idx) => {
      if (stroke.length < 2) return;
      ctx.strokeStyle = "#ff6b6b";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "rgba(255, 107, 107, 0.15)";
      ctx.beginPath();
      ctx.moveTo(stroke[0][0], stroke[0][1]);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i][0], stroke[i][1]);
      }
      ctx.lineTo(stroke[0][0], stroke[0][1]);
      ctx.stroke();
      ctx.fill();

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
  }, []);

  // Load and cache image once - pre-load before rendering canvas
  useEffect(() => {
    if (imageLoadingRef.current) return; // Prevent duplicate loads
    imageLoadingRef.current = true;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        redrawAll([], []);
        setImageLoaded(true); // Signal that image is ready AFTER canvas is drawn
      } else {
        setImageLoaded(true); // Still set loaded even if canvas not ready yet
      }
    };
    img.onerror = () => {
      console.error("Failed to load image for freehand drawing");
      imageLoadingRef.current = false;
    };
    img.src = imgSrc;
  }, [imgSrc, redrawAll]);
  const getCanvasCoords = useCallback(
    (e) => {
      if (!canvasRef.current || !parentContainerRef?.current) return null;

      // Get container position
      const containerRect = parentContainerRef.current.getBoundingClientRect();
      const clientX = e.clientX - containerRect.left;
      const clientY = e.clientY - containerRect.top;

      // Get current transform if available
      let offsetX = 0,
        offsetY = 0,
        scale = 1;
      if (getTransform) {
        const transform = getTransform();
        offsetX = transform.offsetX;
        offsetY = transform.offsetY;
        scale = transform.scale;
      }

      // Convert from container/display coordinates to image coordinates
      const x = (clientX - offsetX) / scale;
      const y = (clientY - offsetY) / scale;

      // Check bounds
      if (
        imageRef.current &&
        (x < 0 ||
          y < 0 ||
          x > imageRef.current.width ||
          y > imageRef.current.height)
      ) {
        return null;
      }

      return [x, y];
    },
    [getTransform, parentContainerRef]
  );

  // Start drawing
  const handleMouseDown = useCallback(
    (e) => {
      isDrawingRef.current = true;
      const coords = getCanvasCoords(e);
      if (coords) {
        currentStrokeRef.current = [coords];
        setCurrentStroke([coords]);
      }
    },
    [getCanvasCoords]
  );

  // Continue drawing - use requestAnimationFrame for smooth rendering
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDrawingRef.current) return;

      const coords = getCanvasCoords(e);
      if (!coords) return;

      currentStrokeRef.current.push(coords);
      setCurrentStroke((prev) => [...prev, coords]);

      // Debounce redraws with requestAnimationFrame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        redrawAll(strokesRef.current, currentStrokeRef.current);
      });
    },
    [getCanvasCoords, redrawAll]
  );

  // Finish stroke - becomes a cell
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
    <div className="absolute inset-0 flex flex-col z-40">
      {/* Canvas - overlays the annotation view */}
      {imageLoaded && (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-1 cursor-crosshair"
          style={{ display: "block" }}
        />
      )}
      {!imageLoaded && (
        <div className="flex-1 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <p className="text-white text-sm">Loading drawing canvas...</p>
        </div>
      )}

      {/* Controls Toolbar */}
      <div className="bg-white bg-opacity-95 border-t border-gray-300 p-3 flex gap-2 flex-wrap items-center">
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
