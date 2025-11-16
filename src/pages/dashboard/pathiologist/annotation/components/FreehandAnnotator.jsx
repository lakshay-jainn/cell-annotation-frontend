import { useEffect, useRef, useState, useCallback } from "react";

export default function FreehandAnnotator({
  imgSrc,
  onSubmit,
  simplifyEpsilon = 3,
  getTransform,
  containerRef: parentContainerRef,
  forceUpdate,
  setPan,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const strokesRef = useRef([]); // Completed strokes in IMAGE coords
  const currentStrokeRef = useRef([]); // Current stroke in IMAGE coords
  const isDrawingRef = useRef(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const [strokes, setStrokes] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Trigger initial redraw when component mounts and image loads
  useEffect(() => {
    if (imageLoaded && forceUpdate) {
      forceUpdate();
    }
  }, [imageLoaded, forceUpdate]);

  // Force initial render on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (forceUpdate) forceUpdate();
    }, 100);
    return () => clearTimeout(timer);
  }, [forceUpdate]);

  // Redraw canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    const transform = getTransform
      ? getTransform()
      : { offsetX: 0, offsetY: 0, scale: 1 };

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transform
    ctx.save();
    ctx.translate(transform.offsetX, transform.offsetY);
    ctx.scale(transform.scale, transform.scale);

    // Draw completed strokes
    strokesRef.current.forEach((stroke, idx) => {
      if (stroke.length < 2) return;

      ctx.strokeStyle = "#ff6b6b";
      ctx.lineWidth = 2 / transform.scale;
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
      const centerX = stroke.reduce((sum, p) => sum + p[0], 0) / stroke.length;
      const centerY = stroke.reduce((sum, p) => sum + p[1], 0) / stroke.length;
      ctx.fillStyle = "#ff6b6b";
      ctx.font = `bold ${14 / transform.scale}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(idx + 1, centerX, centerY);
    });

    // Draw current stroke
    if (currentStrokeRef.current.length >= 2) {
      ctx.strokeStyle = "#ffb86c";
      ctx.lineWidth = 2 / transform.scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(
        currentStrokeRef.current[0][0],
        currentStrokeRef.current[0][1]
      );
      for (let i = 1; i < currentStrokeRef.current.length; i++) {
        ctx.lineTo(
          currentStrokeRef.current[i][0],
          currentStrokeRef.current[i][1]
        );
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [getTransform]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load image for freehand annotation");
    };
    img.src = imgSrc;
  }, [imgSrc]);

  // Setup canvas size to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = parentContainerRef?.current;

    if (!canvas || !container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Redraw after resize
      if (imageRef.current) {
        redraw();
      }
    };

    updateSize();

    // Watch for container resize
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [parentContainerRef, redraw]);

  // Force redraw when transform function changes (zoom/pan/imgSize updates)
  useEffect(() => {
    if (imageLoaded && canvasRef.current) {
      redraw();
    }
  }, [getTransform, imageLoaded, redraw]);

  // Redraw when strokes change
  useEffect(() => {
    redraw();
  }, [strokes, redraw]);

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;

      if (!canvas || !img) return null;

      const rect = canvas.getBoundingClientRect();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;

      const transform = getTransform
        ? getTransform()
        : { offsetX: 0, offsetY: 0, scale: 1 };

      // Reverse the transform: imageCoord = (canvasCoord - offset) / scale
      const imgX = (canvasX - transform.offsetX) / transform.scale;
      const imgY = (canvasY - transform.offsetY) / transform.scale;

      // Check bounds
      if (imgX < 0 || imgY < 0 || imgX > img.width || imgY > img.height) {
        return null;
      }

      return [imgX, imgY];
    },
    [getTransform]
  );

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e) => {
      // Right-click for panning
      if (e.button === 2) {
        e.preventDefault();
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // Left-click for drawing
      if (e.button === 0) {
        e.preventDefault();
        const coords = screenToImage(e.clientX, e.clientY);
        if (coords) {
          isDrawingRef.current = true;
          currentStrokeRef.current = [coords];

          // Force parent update to trigger redraw (same as zoom does)
          if (forceUpdate) forceUpdate();
        }
      }
    },
    [screenToImage, forceUpdate]
  );

  const handleMouseMove = useCallback(
    (e) => {
      // Handle panning
      if (isPanningRef.current && setPan) {
        e.preventDefault();
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        setPan(([px, py]) => [px + dx, py + dy]);
        return;
      }

      // Handle drawing
      if (!isDrawingRef.current) return;

      const coords = screenToImage(e.clientX, e.clientY);
      if (coords) {
        currentStrokeRef.current.push(coords);
        // Force immediate repaint
        requestAnimationFrame(() => redraw());
      }
    },
    [screenToImage, redraw, setPan]
  );

  const handleMouseUp = useCallback(
    (e) => {
      // Handle panning release
      if (e && e.button === 2 && isPanningRef.current) {
        isPanningRef.current = false;
        return;
      }

      if (!isDrawingRef.current) return;

      isDrawingRef.current = false;

      if (currentStrokeRef.current.length >= 3) {
        // Move current stroke to completed strokes
        strokesRef.current.push([...currentStrokeRef.current]);
        currentStrokeRef.current = [];

        // Update state to trigger re-render
        setStrokes([...strokesRef.current]);

        // Force parent update to trigger redraw (same as zoom does)
        if (forceUpdate) forceUpdate();
      } else {
        // Stroke too short, just clear it
        currentStrokeRef.current = [];
        redraw();
      }
    },
    [redraw, forceUpdate]
  ); // Simplify polygon (Ramer-Douglas-Peucker)
  const simplifyPolygon = useCallback((points, epsilon) => {
    if (points.length <= 2) return points;

    const pointLineDistance = (point, lineStart, lineEnd) => {
      const [x0, y0] = lineStart;
      const [x1, y1] = lineEnd;
      const [px, py] = point;

      const num = Math.abs((y1 - y0) * px - (x1 - x0) * py + x1 * y0 - y1 * x0);
      const den = Math.sqrt((y1 - y0) ** 2 + (x1 - x0) ** 2);

      return den === 0 ? 0 : num / den;
    };

    const rdp = (pts, eps) => {
      if (pts.length <= 2) return pts;

      let maxDist = 0;
      let maxIdx = 0;
      const first = pts[0];
      const last = pts[pts.length - 1];

      for (let i = 1; i < pts.length - 1; i++) {
        const dist = pointLineDistance(pts[i], first, last);
        if (dist > maxDist) {
          maxDist = dist;
          maxIdx = i;
        }
      }

      if (maxDist > eps) {
        const left = rdp(pts.slice(0, maxIdx + 1), eps);
        const right = rdp(pts.slice(maxIdx), eps);
        return [...left.slice(0, -1), ...right];
      }

      return [first, last];
    };

    return rdp(points, epsilon);
  }, []);

  // Actions
  const handleUndo = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current.pop();
    setStrokes([...strokesRef.current]);
    redraw();
  }, [redraw]);

  const handleClear = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    setStrokes([]);
    redraw();
  }, [redraw]);

  const handleSubmit = useCallback(() => {
    if (strokesRef.current.length === 0) {
      alert("Please draw at least one cell.");
      return;
    }

    strokesRef.current.forEach((stroke, idx) => {
      const simplified = simplifyPolygon(stroke, simplifyEpsilon);

      // Ensure closed polygon
      const coords =
        simplified[0][0] === simplified[simplified.length - 1][0] &&
        simplified[0][1] === simplified[simplified.length - 1][1]
          ? simplified
          : [...simplified, simplified[0]];

      const polygon = {
        type: "Polygon",
        coordinates: [coords],
      };

      onSubmit(polygon, {
        cellNumber: idx + 1,
        totalCells: strokesRef.current.length,
        pointCount: coords.length,
      });
    });

    handleClear();
  }, [simplifyPolygon, simplifyEpsilon, onSubmit, handleClear]);

  return (
    <div className="absolute inset-0 z-50 pointer-events-auto">
      {/* Canvas */}
      {imageLoaded && (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{
            touchAction: "none",
            backgroundColor: "rgba(0, 255, 0, 0.05)", // Slight green tint to see canvas
          }}
        />
      )}

      {!imageLoaded && (
        <div className="flex items-center justify-center h-full bg-gray-900 bg-opacity-50">
          <p className="text-white text-sm">Loading drawing canvas...</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 border-t border-gray-300 p-3 flex gap-2 items-center z-50">
        <div className="text-xs text-gray-600 flex-1">
          <p className="font-semibold">Cells: {strokes.length}</p>
          {strokes.length > 0 ? (
            <p className="text-green-600">✓ Draw more cells or submit</p>
          ) : (
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

        <span className="text-xs text-gray-500">Each stroke = 1 celll</span>
      </div>
    </div>
  );
}
