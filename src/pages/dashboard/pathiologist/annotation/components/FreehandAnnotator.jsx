import { useEffect, useRef, useState } from "react";

/**
 * FreehandAnnotator - True freehand drawing mode
 * Allows users to draw multiple freehand cells.
 * Each stroke becomes a separate polygon (cell).
 *
 * Props:
 *   - imgSrc: URL or data URL of the image
 *   - onSubmit: callback(geojson, metadata) when user submits drawing
 *   - simplifyEpsilon: line simplification epsilon (default: 3)
 */

export default function FreehandAnnotator({
  imgSrc,
  onSubmit,
  simplifyEpsilon = 3,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [strokes, setStrokes] = useState([]); // Array of completed stroke paths (each is a cell)
  const [currentStroke, setCurrentStroke] = useState([]); // Current drawing in progress
  const [isDrawing, setIsDrawing] = useState(false);

  // Load and cache image once
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        redrawCanvas(canvas, [], []);
      }
    };
    img.src = imgSrc;
  }, [imgSrc]);

  // Redraw canvas with all strokes
  const redrawCanvas = (canvas, allStrokes, currentDrawing) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!imageRef.current) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    // Draw completed strokes (each stroke is a separate cell)
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
      // Close each cell polygon
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
  };

  // Get canvas coordinates from mouse event
  const getCanvasCoords = (e) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return [x, y];
  };

  // Start drawing
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    if (coords) {
      setCurrentStroke([coords]);
    }
  };

  // Continue drawing
  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const coords = getCanvasCoords(e);
    if (!coords) return;

    setCurrentStroke((prev) => {
      const updated = [...prev, coords];
      redrawCanvas(canvasRef.current, strokes, updated);
      return updated;
    });
  };

  // Finish stroke - becomes a cell
  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length >= 3) {
      // Need at least 3 points for a valid polygon
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke([]);
      redrawCanvas(canvasRef.current, [...strokes, currentStroke], []);
    } else {
      // Discard too-small strokes
      setCurrentStroke([]);
      redrawCanvas(canvasRef.current, strokes, []);
    }
  };

  // Simplify polygon using Ramer-Douglas-Peucker algorithm
  const simplifyPolygon = (polygon, epsilon = 3) => {
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
  };

  // Undo last stroke/cell
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    redrawCanvas(canvasRef.current, updated, []);
  };

  // Clear all strokes
  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    redrawCanvas(canvasRef.current, [], []);
  };

  // Submit all cells (each stroke is a separate polygon)
  const handleSubmit = () => {
    if (strokes.length === 0) {
      alert("Please draw at least one cell.");
      return;
    }

    // Convert each stroke to a separate polygon
    const polygons = strokes.map((stroke) => {
      const simplified = simplifyPolygon(stroke, simplifyEpsilon);

      // Close the polygon
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

    // Submit all polygons at once
    polygons.forEach((polygon, idx) => {
      onSubmit(polygon, {
        cellNumber: idx + 1,
        totalCells: polygons.length,
        pointCount: polygon.coordinates[0].length,
      });
    });

    handleClear();
  };

  return (
    <div className="absolute inset-0 flex flex-col z-40">
      {/* Canvas - overlays the annotation view */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 cursor-crosshair"
        style={{ display: "block" }}
      />

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
