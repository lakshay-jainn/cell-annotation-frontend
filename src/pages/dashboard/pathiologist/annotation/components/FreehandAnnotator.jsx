import { useEffect, useRef, useState } from "react";

/**
 * FreehandAnnotator
 * Allows users to draw freehand polygons on an image.
 * Returns GeoJSON-like polygon in image pixel coordinates.
 *
 * Props:
 *   - imgSrc: URL or data URL of the image
 *   - onSubmit: callback(geojson, metadata) when user submits drawing
 *   - minPoints: minimum points to form a valid polygon (default: 3)
 *   - simplifyEpsilon: line simplification epsilon (default: 2)
 *   - mode: "image" (default) or "osd" for OpenSeadragon
 *   - osdViewerRef: ref to OSD viewer (if mode="osd")
 */

export default function FreehandAnnotator({
  imgSrc,
  onSubmit,
  minPoints = 3,
  simplifyEpsilon = 2,
  mode = "image",
  osdViewerRef,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // Load image and set up canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgSrc) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      setImgSize({ width: img.width, height: img.height });

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Redraw any existing points
      redrawCanvas(ctx, img, points);
    };

    img.src = imgSrc;
  }, [imgSrc]);

  // Redraw canvas with current points
  const redrawCanvas = (ctx, img, currentPoints) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0);

    if (currentPoints.length === 0) return;

    // Draw line connecting points
    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(255, 107, 107, 0.1)";
    ctx.beginPath();
    ctx.moveTo(currentPoints[0][0], currentPoints[0][1]);

    for (let i = 1; i < currentPoints.length; i++) {
      ctx.lineTo(currentPoints[i][0], currentPoints[i][1]);
    }

    // Close path if we have enough points (for visual feedback)
    if (currentPoints.length >= minPoints) {
      ctx.lineTo(currentPoints[0][0], currentPoints[0][1]);
    }

    ctx.stroke();
    ctx.fill();

    // Draw points as circles
    ctx.fillStyle = "#ff6b6b";
    currentPoints.forEach((point, idx) => {
      ctx.beginPath();
      ctx.arc(point[0], point[1], 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw point index
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(idx + 1, point[0], point[1]);
      ctx.fillStyle = "#ff6b6b";
    });
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

  // Handle canvas click to add point
  const handleCanvasClick = (e) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setPoints((prev) => {
      const updated = [...prev, coords];
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => redrawCanvas(ctx, img, updated);
      img.src = imgSrc;
      return updated;
    });
  };

  // Handle canvas mouse move for preview
  const handleCanvasMouseMove = (e) => {
    if (points.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      redrawCanvas(ctx, img, points);

      // Draw preview line to cursor
      const coords = getCanvasCoords(e);
      if (coords) {
        ctx.strokeStyle = "#ffb86c";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(points[points.length - 1][0], points[points.length - 1][1]);
        ctx.lineTo(coords[0], coords[1]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    img.src = imgSrc;
  };

  // Simplify polygon using Ramer-Douglas-Peucker algorithm
  const simplifyPolygon = (polygon, epsilon = 2) => {
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

  // Undo last point
  const handleUndo = () => {
    setPoints((prev) => {
      if (prev.length === 0) return prev;
      const updated = prev.slice(0, -1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => redrawCanvas(ctx, img, updated);
      img.src = imgSrc;
      return updated;
    });
  };

  // Clear all points
  const handleClear = () => {
    setPoints([]);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = imgSrc;
  };

  // Submit polygon
  const handleSubmit = () => {
    if (points.length < minPoints) {
      alert(`Please draw at least ${minPoints} points.`);
      return;
    }

    // Simplify polygon
    const simplified = simplifyPolygon(points, simplifyEpsilon);

    // Create GeoJSON-like polygon
    // Close the polygon if not already closed
    const coords =
      simplified[0][0] === simplified[simplified.length - 1][0] &&
      simplified[0][1] === simplified[simplified.length - 1][1]
        ? simplified
        : [...simplified, simplified[0]];

    const geojson = {
      type: "Polygon",
      coordinates: [coords],
    };

    onSubmit(geojson, {
      pointCount: points.length,
      simplified: simplified.length,
    });
    handleClear();
  };

  // Auto-close polygon if user clicks near start point
  const handleAutoClose = () => {
    if (points.length < minPoints) return;

    const first = points[0];
    const last = points[points.length - 1];
    const distance = Math.hypot(last[0] - first[0], last[1] - first[1]);

    // If last point is within 15 pixels of first, auto-close
    if (distance < 15) {
      setPoints((prev) => [...prev, first]);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onDoubleClick={handleAutoClose}
        className="flex-1 border border-blue-400 cursor-crosshair bg-gray-100"
        style={{ maxHeight: "100%", objectFit: "contain" }}
      />

      {/* Controls */}
      <div className="bg-white border-t border-gray-200 p-3 flex gap-2 flex-wrap">
        <div className="text-xs text-gray-600 flex-1">
          <p>Points: {points.length}</p>
          {points.length > 0 && (
            <p className="text-green-600">
              {points.length >= minPoints
                ? "✓ Ready to submit"
                : `Need ${minPoints - points.length} more point(s)`}
            </p>
          )}
        </div>

        <button
          onClick={handleUndo}
          disabled={points.length === 0}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Undo
        </button>

        <button
          onClick={handleClear}
          disabled={points.length === 0}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Clear
        </button>

        <button
          onClick={handleSubmit}
          disabled={points.length < minPoints}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Submit Polygon
        </button>

        <p className="text-xs text-gray-500 w-full">
          Double-click near the start point to close polygon automatically.
        </p>
      </div>
    </div>
  );
}
