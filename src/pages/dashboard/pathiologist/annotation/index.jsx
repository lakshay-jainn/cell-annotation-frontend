import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import axiosClient from "../../../../services/api/axios/axiosClient";
import Papa from "papaparse";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES, CELL_TYPES } from "../../../../utils/constants";
import toast from "react-hot-toast";

// Import extracted components
import CellTypeAnnotation from "./components/CellTypeAnnotation.jsx";
import AnnotatedCellsList from "./components/AnnotatedCellsList.jsx";
import AnnotationActions from "./components/AnnotationActions.jsx";
import FinalAssessment from "./components/FinalAssessment.jsx";
import ZoomControls from "./components/ZoomControls.jsx";
import AppearanceControls from "./components/AppearanceControls.jsx";
import StatisticsPanel from "./components/StatisticsPanel.jsx";
import AnnotationView from "./components/AnnotationView.jsx";
import ImageQualityCheck from "./components/ImageQualityCheck.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import CellStateLegend from "./components/CellStateLegend.jsx";
import FreehandAnnotator from "./components/FreehandAnnotator.jsx";

export default function PointAnnotator() {
  const { patientId } = useParams(); // Changed from jobId to patientId
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const navigate = useNavigate();

  // Patient and slide state
  const [currentSlide, setCurrentSlide] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [allSlidesCompleted, setAllSlidesCompleted] = useState(false);

  // Data state
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [cellPredictions, setCellPredictions] = useState([]);
  const [imgSize, setImgSize] = useState([0, 0]); // [height, width]

  const [showImageQualityCheck, setShowImageQualityCheck] = useState(false);

  const [selectedCellType, setSelectedCellType] = useState("");
  const [cellTypeOther, setCellTypeOther] = useState("");
  const [annotatedCells, setAnnotatedCells] = useState([]); // Array of {cellIndex, cellType, timestamp}
  const [cellTypeCounts, setCellTypeCounts] = useState({});

  // Remove adequacy and diagnosis - these are now patient-level
  // const [adequacy, setAdequacy] = useState("");
  // const [inadequacyReason, setInadequacyReason] = useState("");
  // const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("");
  // const [provisionalDiagnosisReason, setProvisionalDiagnosisReason] = useState("");
  const [annotatedPoints, setAnnotatedPoints] = useState([]);
  const [userSelectedCells, setUserSelectedCells] = useState(new Set()); // Only user-selected cells
  const [autoSelectedCells, setAutoSelectedCells] = useState(new Set()); // Auto-generated cells
  const [previouslyGeneratedCandidates, setPreviouslyGeneratedCandidates] =
    useState([]); // Store auto-generated candidates for cumulative mode
  const [strictness, setStrictness] = useState(5); // Detection strictness: 1-10 (1=most lenient, 10=most strict)

  const selectedCells = new Set([...userSelectedCells, ...autoSelectedCells]); // Combined for display

  // UI state
  const [pointSize, setPointSize] = useState(4);
  const [pointColor, setPointColor] = useState("#008000");
  const [loadingAutoSelect, setLoadingAutoSelect] = useState(false);
  const [freehandMode, setFreehandMode] = useState(false);
  const [nextSyntheticId, setNextSyntheticId] = useState(-1);

  const cellTypeOptions = CELL_TYPES;

  // Zoom and pan state
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState([0, 0]);
  const [lastMousePos, setLastMousePos] = useState(null);

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 8.0;

  // Pan state
  const panningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  /* ---------------- CSV parsing ---------------- */
  const parseCsvData = useCallback((csvText) => {
    try {
      if (!csvText || typeof csvText !== "string") {
        console.error(" Invalid CSV text provided");
        return [];
      }

      const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value?.trim() || "",
        dynamicTyping: false,
      });

      if (parseResult.errors.length > 0) {
        console.warn(" CSV parsing warnings:", parseResult.errors);
      }

      const data = parseResult.data;
      if (!data || data.length === 0) {
        console.error(" No data found in CSV");
        return [];
      }

      const requiredHeaders = ["x0", "y0", "x1", "y1", "score", "label"];
      const headers = Object.keys(data[0] || {});
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );
      if (missingHeaders.length > 0) {
        console.warn(" Missing headers:", missingHeaders);
      }

      const predictions = [];

      data.forEach((row, index) => {
        try {
          const safeParseFloat = (val, fallback = 0) => {
            const parsed = Number.parseFloat(val);
            return isNaN(parsed) ? fallback : parsed;
          };

          const safeParseInt = (val, fallback = 0) => {
            const parsed = Number.parseInt(val);
            return isNaN(parsed) ? fallback : parsed;
          };

          const x0 = safeParseFloat(row.x0);
          const y0 = safeParseFloat(row.y0);
          const x1 = safeParseFloat(row.x1);
          const y1 = safeParseFloat(row.y1);
          const score = safeParseFloat(row.score);
          const label = safeParseInt(row.label);

          let polyX = [];
          let polyY = [];

          if (row.poly_x && row.poly_y) {
            try {
              // if already arrays, keep them; otherwise parse comma strings
              polyX = Array.isArray(row.poly_x)
                ? row.poly_x.map((v) => Number.parseFloat(v))
                : row.poly_x
                    .toString()
                    .split(",")
                    .map((x) => safeParseFloat(x.trim()))
                    .filter((x) => !isNaN(x));

              polyY = Array.isArray(row.poly_y)
                ? row.poly_y.map((v) => Number.parseFloat(v))
                : row.poly_y
                    .toString()
                    .split(",")
                    .map((y) => safeParseFloat(y.trim()))
                    .filter((y) => !isNaN(y));

              const minLength = Math.min(polyX.length, polyY.length);
              polyX = polyX.slice(0, minLength);
              polyY = polyY.slice(0, minLength);
            } catch (polyError) {
              console.warn(
                ` Failed to parse polygon for row ${index}:`,
                polyError
              );
              polyX = [];
              polyY = [];
            }
          }

          let centroidX, centroidY;
          if (polyX.length > 0 && polyY.length > 0) {
            centroidX = polyX.reduce((a, b) => a + b, 0) / polyX.length;
            centroidY = polyY.reduce((a, b) => a + b, 0) / polyY.length;
          } else {
            centroidX = x0 + (x1 - x0) / 2;
            centroidY = y0 + (y1 - y0) / 2;
          }

          if (isNaN(centroidX) || isNaN(centroidY)) {
            console.warn(` Invalid centroid for row ${index}, skipping`);
            return;
          }

          predictions.push({
            x0,
            y0,
            x1,
            y1,
            score,
            label,
            poly_x: polyX,
            poly_y: polyY,
            centroid: { x: centroidX, y: centroidY },
            rowIndex: index,
          });
        } catch (rowError) {
          console.error(` Error parsing row ${index}:`, rowError);
        }
      });

      console.log(
        ` Successfully parsed ${predictions.length} predictions from ${data.length} rows`
      );
      return predictions;
    } catch (error) {
      console.error(" Critical CSV parsing error:", error);
      return [];
    }
  }, []);

  /* ---------------- Freehand polygon conversion helper ---------------- */
  const makePredictionFromPolygon = useCallback(
    (polygonCoords) => {
      // polygonCoords: array of [x,y] in IMAGE PIXELS
      const coords = polygonCoords.slice();
      // Remove duplicate closing point if present
      if (coords.length > 1) {
        const first = coords[0];
        const last = coords[coords.length - 1];
        if (first[0] === last[0] && first[1] === last[1]) coords.pop();
      }

      const poly_x = coords.map((p) => (Number.isFinite(p[0]) ? p[0] : 0));
      const poly_y = coords.map((p) => (Number.isFinite(p[1]) ? p[1] : 0));

      // Compute bbox from polygon
      const xs = poly_x;
      const ys = poly_y;
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      // Compute centroid (arithmetic mean)
      const centroidX = xs.reduce((a, b) => a + b, 0) / xs.length;
      const centroidY = ys.reduce((a, b) => a + b, 0) / ys.length;

      // Use synthetic negative ID
      const rowIndex = nextSyntheticId;
      setNextSyntheticId((id) => id - 1);

      return {
        x0: minX,
        y0: minY,
        x1: maxX,
        y1: maxY,
        score: 1.0,
        label: 0,
        poly_x: poly_x,
        poly_y: poly_y,
        centroid: { x: centroidX, y: centroidY },
        rowIndex,
        src: "manual_draw",
      };
    },
    [nextSyntheticId]
  );

  /* ---------------- Load next slide for patient ---------------- */
  const loadNextSlide = useCallback(async () => {
    if (!patientId) return;

    setLoading(true);
    try {
      console.log(" Loading next slide for patient:", patientId);
      const response = await axiosClient.get(
        `/patient/${patientId}/next-slide`
      );
      const slideData = response.data;

      setCurrentSlide(slideData);

      // Load image
      const img = new Image();
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve([img.height, img.width]);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = slideData.image.url;
      });

      const csvResponse = await axiosClient.get(slideData.csv.url);
      const csvText = csvResponse.data;
      const predictions = parseCsvData(csvText);

      if (predictions.length === 0) {
        console.warn(" No valid predictions found in CSV");
      }

      const [imgHeight, imgWidth] = await imageLoadPromise;

      // No scaling - use raw coordinates from CSV
      setImageUrl(slideData.image.url);
      setCellPredictions(predictions);
      setImgSize([imgHeight, imgWidth]);
      setAnnotatedPoints([]);
      setUserSelectedCells(new Set());
      setAutoSelectedCells(new Set());
      setAnnotatedCells([]);
      setCellTypeCounts({});
      setZoom(1.0);
      setPan([0, 0]);

      setShowImageQualityCheck(true);

      console.log(" Slide data loaded successfully");
    } catch (error) {
      if (error.response?.status === 404) {
        // No more slides - all completed
        setAllSlidesCompleted(true);
        setShowImageQualityCheck(false);
      } else {
        console.error(" Failed to load slide data:", error);
        toast.error("Failed to load slide data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [patientId, parseCsvData]);

  /* ---------------- Load patient info ---------------- */
  const loadPatientInfo = useCallback(async () => {
    if (!patientId) return;

    try {
      const response = await axiosClient.get(`/patient/${patientId}/samples`);
      setPatientInfo(response.data);
    } catch (error) {
      console.error(" Failed to load patient info:", error);
    }
  }, [patientId]);

  useEffect(() => {
    loadPatientInfo();
    loadNextSlide();
  }, [loadPatientInfo, loadNextSlide]);

  const handleImageQuality = async (isGoodQuality) => {
    if (!isGoodQuality) {
      // Save poor quality annotation and move to next slide
      const formData = new FormData();
      formData.append("job_id", currentSlide.sample.job_id);
      formData.append("image_quality", false);
      formData.append("cellTypeCounts", JSON.stringify({}));

      try {
        await axiosClient.post("/annotate", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        // Load next slide
        loadNextSlide();
      } catch (error) {
        console.error("Failed to submit image quality:", error);
        toast.error("Failed to submit image quality. Please try again.");
      }
    } else {
      setShowImageQualityCheck(false);
    }
  };

  /* ---------------- Freehand polygon submission handler ---------------- */
  const handleFreehandSubmit = useCallback(
    (polygonGeoJson) => {
      if (!polygonGeoJson || polygonGeoJson.type !== "Polygon") {
        toast.error("Invalid polygon data");
        setFreehandMode(false);
        return;
      }

      const ring = polygonGeoJson.coordinates && polygonGeoJson.coordinates[0];
      if (!ring || ring.length < 3) {
        toast.error("Draw a valid polygon (minimum 3 points).");
        setFreehandMode(false);
        return;
      }

      // Convert polygon to prediction using safer functional update
      setCellPredictions((prev) => {
        const newIndex = prev.length;
        const newPred = makePredictionFromPolygon(ring);
        const updated = [...prev, newPred];

        // Update selected cells
        setUserSelectedCells((s) => {
          const next = new Set(s);
          next.add(newIndex);
          return next;
        });

        // Update annotated points
        setAnnotatedPoints((s) => [
          ...s,
          {
            x: newPred.centroid.x,
            y: newPred.centroid.y,
            src: "manual_draw",
            score: newPred.score,
            cellIndex: newIndex,
          },
        ]);

        return updated;
      });

      setFreehandMode(false);
      toast.success(
        "Freehand polygon added! Remember to select a cell type and save annotation."
      );
    },
    [makePredictionFromPolygon]
  );

  /* ---------------- Transform helpers ---------------- */
  const getTransform = useCallback(() => {
    const contRect = containerRef.current?.getBoundingClientRect();
    const containerW = contRect ? contRect.width : window.innerWidth;
    const containerH = contRect ? contRect.height : window.innerHeight;

    const [imgH, imgW] = imgSize;
    if (!imgW || !imgH || !containerW || !containerH) {
      return {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        dispW: containerW,
        dispH: containerH,
        containerW,
        containerH,
        baseScale: 1,
      };
    }

    const baseScale = Math.min(containerW / imgW, containerH / imgH);
    const scale = baseScale * zoom;
    const dispW = imgW * scale;
    const dispH = imgH * scale;
    const offsetX = (containerW - dispW) / 2 + pan[0];
    const offsetY = (containerH - dispH) / 2 + pan[1];

    return {
      scale,
      offsetX,
      offsetY,
      dispW,
      dispH,
      containerW,
      containerH,
      baseScale,
    };
  }, [imgSize, zoom, pan]);

  const clientToImageCoords = useCallback(
    (clientX, clientY) => {
      const contRect = containerRef.current?.getBoundingClientRect();
      if (!contRect) return null;

      const { scale, offsetX, offsetY, dispW, dispH } = getTransform();
      const px = clientX - contRect.left - offsetX;
      const py = clientY - contRect.top - offsetY;

      if (px < 0 || py < 0 || px > dispW || py > dispH) return null;

      return { x: px / scale, y: py / scale };
    },
    [getTransform]
  );

  /* ---------------- Deterministic center zoom ---------------- */
  const setZoomAboutClient = useCallback(
    (factor) => {
      if (!containerRef.current) return;

      const contRect = containerRef.current.getBoundingClientRect();
      const {
        baseScale,
        scale: oldScale,
        offsetX: oldOffsetX,
        offsetY: oldOffsetY,
        dispW,
        dispH,
      } = getTransform();

      const [imgH, imgW] = imgSize;
      if (!imgW || !imgH) {
        setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * factor)));
        return;
      }

      // Image center in image coordinates
      const imgCenterX = imgW / 2;
      const imgCenterY = imgH / 2;

      // Client coords of the visible image center (focus point)
      const clientCenterX = contRect.left + oldOffsetX + dispW / 2;
      const clientCenterY = contRect.top + oldOffsetY + dispH / 2;

      // Compute new scale and clamp
      let newScale = oldScale * factor;
      const minScale = baseScale * MIN_ZOOM;
      const maxScale = baseScale * MAX_ZOOM;
      newScale = Math.max(minScale, Math.min(maxScale, newScale));
      const newZoom = newScale / baseScale;

      // New offsets so image center stays at clientCenter
      const newOffsetX = clientCenterX - imgCenterX * newScale;
      const newOffsetY = clientCenterY - imgCenterY * newScale;

      const deltaX = newOffsetX - oldOffsetX;
      const deltaY = newOffsetY - oldOffsetY;

      setPan(([px, py]) => [px + deltaX, py + deltaY]);
      setZoom(newZoom);
    },
    [getTransform, imgSize]
  );

  const zoomByFactor = useCallback(
    (factor) => {
      const contRect = containerRef.current?.getBoundingClientRect();
      if (!contRect) {
        setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * factor)));
        return;
      }
      setZoomAboutClient(factor);
    },
    [setZoomAboutClient]
  );

  /* ---------------- Mouse / pan handlers ---------------- */
  const onMouseMove = useCallback((ev) => {
    setLastMousePos({ x: ev.clientX, y: ev.clientY });

    if (!panningRef.current) return;
    ev.preventDefault();
    const dx = ev.clientX - panStartRef.current.x;
    const dy = ev.clientY - panStartRef.current.y;
    panStartRef.current = { x: ev.clientX, y: ev.clientY };
    setPan(([px, py]) => [px + dx, py + dy]);
  }, []);

  const onMouseDown = useCallback((ev) => {
    if (ev.button === 2 && containerRef.current) {
      ev.preventDefault();
      panningRef.current = true;
      panStartRef.current = { x: ev.clientX, y: ev.clientY };
      if (svgRef.current) svgRef.current.style.cursor = "grabbing";
    }
  }, []);

  const onMouseUp = useCallback((ev) => {
    if (ev.button === 2 && panningRef.current) {
      panningRef.current = false;
      if (svgRef.current) svgRef.current.style.cursor = "crosshair";
    }
  }, []);

  /* ---------------- Selection handlers ---------------- */
  const snapThreshold = useMemo(() => Math.max(15, pointSize * 2), [pointSize]);

  const toggleSelectCell = useCallback(
    (index) => {
      const cell = cellPredictions[index];
      if (!cell) return;

      // Check if cell is already annotated (disabled) - prevent selection
      const isAnnotated = annotatedCells.some((a) => a.cellIndex === index);
      if (isAnnotated) {
        toast.error(
          "This cell has already been annotated and cannot be selected again."
        );
        return;
      }

      // Check if the cell is auto-selected and remove it from auto-selected if so
      if (autoSelectedCells.has(index)) {
        setAutoSelectedCells((prevSelected) => {
          const newSelected = new Set(prevSelected);
          newSelected.delete(index);
          return newSelected;
        });

        // Remove from annotated points if it exists
        setAnnotatedPoints((prev) => prev.filter((p) => p.cellIndex !== index));

        // Remove from previously generated candidates if it exists
        setPreviouslyGeneratedCandidates((prev) =>
          prev.filter((candidate) => candidate.cellIndex !== index)
        );

        return;
      }

      // Handle user-selected cells (existing logic)
      setUserSelectedCells((prevSelected) => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(index)) {
          newSelected.delete(index);
          setAnnotatedPoints((prev) =>
            prev.filter((p) => p.cellIndex !== index)
          );
        } else {
          newSelected.add(index);
          setAnnotatedPoints((prev) => [
            ...prev,
            {
              x: cell.centroid.x,
              y: cell.centroid.y,
              src: "manual",
              score: cell.score,
              cellIndex: index,
            },
          ]);
        }
        return newSelected;
      });
    },
    [cellPredictions, autoSelectedCells, annotatedCells]
  );

  // legacy click fallback: if user clicks directly on SVG somewhere else, snap to nearest centroid
  const onSvgClick = useCallback(
    (ev) => {
      if (ev.button !== 0) return;
      ev.preventDefault();

      const coords = clientToImageCoords(ev.clientX, ev.clientY);
      if (!coords) return;

      const { x, y } = coords;
      let closestCell = -1;
      let closestDistance = Number.POSITIVE_INFINITY;

      cellPredictions.forEach((cell, index) => {
        const distance = Math.hypot(cell.centroid.x - x, cell.centroid.y - y);
        if (distance < closestDistance && distance <= snapThreshold) {
          closestDistance = distance;
          closestCell = index;
        }
      });

      if (closestCell >= 0) toggleSelectCell(closestCell);
    },
    [clientToImageCoords, cellPredictions, snapThreshold, toggleSelectCell]
  );

  /* ---------------- Dynamic cell detection ---------------- */
  const runDynamicCellDetection = useCallback(
    async (mode = "cumulative") => {
      const minCells = mode === "user_only" ? 5 : 1; // Allow fewer for cumulative
      if (selectedCells.size < minCells) {
        toast.error(
          `Please select at least ${minCells} cells before using dynamic cell detection.`
        );
        return;
      }

      setLoadingAutoSelect(true);
      try {
        // Prepare annotations based on mode
        let cellsToUse = [];

        if (mode === "user_only") {
          // Only user-selected cells
          cellsToUse = cellPredictions.map((cell, index) => ({
            label: `cell_${index}`,
            x: cell.centroid.x,
            y: cell.centroid.y,
            score: cell.score || 0,
            selected: userSelectedCells.has(index) ? 1 : 0,
          }));
        } else {
          // Cumulative: user-selected + auto-selected + previously generated
          const allSelectedIndices = new Set([
            ...userSelectedCells,
            ...autoSelectedCells,
          ]);
          previouslyGeneratedCandidates.forEach((candidate) => {
            if (candidate.cellIndex !== null) {
              allSelectedIndices.add(candidate.cellIndex);
            }
          });

          cellsToUse = cellPredictions.map((cell, index) => ({
            label: `cell_${index}`,
            x: cell.centroid.x,
            y: cell.centroid.y,
            score: cell.score || 0,
            selected: allSelectedIndices.has(index) ? 1 : 0,
          }));
        }

        // Convert to CSV format
        const csvData = Papa.unparse(cellsToUse);

        // Create FormData with CSV and S3 object key instead of image blob
        const formData = new FormData();
        formData.append("annotations", csvData);
        formData.append("jobId", currentSlide.sample.job_id);
        formData.append("s3_object_key", currentSlide.sample.s3_object_key); // Use S3 key instead of image blob
        formData.append("mode", mode); // Pass the mode to backend
        formData.append("strictness", strictness); // Pass the strictness level to backend        // Call backend API with FormData
        const response = await axiosClient.post(
          "/dynamic-cells/detect-from-selected",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Parse the returned CSV data containing additional polygons
        const additionalPolygons = Papa.parse(response.data.csv, {
          header: true,
          dynamicTyping: true,
        }).data;

        // Get set of already annotated cell indices to exclude them from results
        const annotatedCellIndices = new Set(
          annotatedCells.map((a) => a.cellIndex)
        );

        // Add the new polygons to the existing annotations
        const newPoints = [...annotatedPoints];
        const newAutoSelected = new Set(autoSelectedCells);

        // Replace your additionalPolygons.forEach(...) block with this
        const MAX_MATCH_DIST = 20; // pixels — increased from 12 to be more lenient
        additionalPolygons.forEach((polygon) => {
          if (typeof polygon.x !== "number" || typeof polygon.y !== "number")
            return;

          // Try to extract a cell index from label (backwards compatibility)
          let cellIndex = null;
          if (polygon.label && polygon.label.startsWith("cell_")) {
            cellIndex = Number.parseInt(polygon.label.replace("cell_", ""), 10);
            if (Number.isNaN(cellIndex)) cellIndex = null;
          }

          // If no explicit index, find nearest predicted cell by centroid
          if (cellIndex === null) {
            let bestIdx = null;
            let bestDist2 = Infinity;
            for (let i = 0; i < cellPredictions.length; i++) {
              const c = cellPredictions[i].centroid ||
                cellPredictions[i].centroid_xy || {
                  x: cellPredictions[i].x,
                  y: cellPredictions[i].y,
                };
              if (!c) continue;
              const dx = c.x - polygon.x;
              const dy = c.y - polygon.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < bestDist2) {
                bestDist2 = d2;
                bestIdx = i;
              }
            }
            // accept only if within threshold (squared distance)
            if (
              bestIdx !== null &&
              bestDist2 <= MAX_MATCH_DIST * MAX_MATCH_DIST
            ) {
              cellIndex = bestIdx;
            }
          }

          // Avoid adding duplicate annotatedPoints: check if a point already exists nearby
          const DUPLICATE_DIST = 15; // pixels - increased from 8 to be more lenient
          let isDuplicate = false;
          for (const p of newPoints) {
            const dx = p.x - polygon.x;
            const dy = p.y - polygon.y;
            if (
              dx * dx + dy * dy <= DUPLICATE_DIST * DUPLICATE_DIST &&
              p.src === "auto_similar_api"
            ) {
              isDuplicate = true;
              break;
            }
          }
          if (isDuplicate) return;

          // Skip if this cell is already annotated (disabled)
          if (cellIndex !== null && annotatedCellIndices.has(cellIndex)) {
            return;
          }

          // Add the new point (but mark cellIndex if matched)
          newPoints.push({
            x: polygon.x,
            y: polygon.y,
            src: "auto_similar_api",
            score: polygon.score || 0,
            cellIndex: cellIndex, // may be null if no matching cell found
          });

          // If we have a valid cellIndex, add it to auto-selected cells
          if (cellIndex !== null && cellIndex < cellPredictions.length) {
            newAutoSelected.add(cellIndex);
          }
        });

        setAutoSelectedCells(newAutoSelected);
        setAnnotatedPoints(newPoints);

        // Update previously generated candidates only for cumulative mode
        if (mode === "cumulative") {
          const newGenerated = additionalPolygons.map((polygon) => ({
            x: polygon.x,
            y: polygon.y,
            cellIndex: null, // Will be set if matched
            score: polygon.score || 0,
          }));

          // Set cellIndex for matched ones
          newGenerated.forEach((candidate) => {
            let bestIdx = null;
            let bestDist2 = Infinity;
            for (let i = 0; i < cellPredictions.length; i++) {
              const c = cellPredictions[i].centroid || {
                x: cellPredictions[i].x,
                y: cellPredictions[i].y,
              };
              if (!c) continue;
              const dx = c.x - candidate.x;
              const dy = c.y - candidate.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < bestDist2) {
                bestDist2 = d2;
                bestIdx = i;
              }
            }
            if (
              bestIdx !== null &&
              bestDist2 <= MAX_MATCH_DIST * MAX_MATCH_DIST
            ) {
              candidate.cellIndex = bestIdx;
            }
          });

          setPreviouslyGeneratedCandidates((prev) => [
            ...prev,
            ...newGenerated,
          ]);
        }

        console.log(
          ` Added ${additionalPolygons.length} additional polygons from dynamic detection API (mode: ${mode})`
        );
      } catch (error) {
        console.error(" Dynamic cell detection API failed:", error);
        toast.error("Dynamic cell detection failed. Please try again.");
      } finally {
        setLoadingAutoSelect(false);
      }
    },
    [
      userSelectedCells,
      autoSelectedCells,
      cellPredictions,
      annotatedPoints,
      currentSlide,
      previouslyGeneratedCandidates,
      strictness,
    ]
  );

  /* ---------------- Utility actions ---------------- */
  const fitToScreen = useCallback(() => {
    setZoom(1.0);
    setPan([0, 0]);
  }, []);

  const clearAll = useCallback(() => {
    if (selectedCells.size > 0 && !confirm("Clear all selected cells?")) return;
    setUserSelectedCells(new Set());
    setAutoSelectedCells(new Set());
    setAnnotatedPoints([]);
    setPreviouslyGeneratedCandidates([]); // Clear generated candidates too
  }, [selectedCells.size]);

  const undoLast = useCallback(() => {
    if (annotatedPoints.length === 0) return;

    const lastPoint = annotatedPoints[annotatedPoints.length - 1];

    if (lastPoint.src === "auto_similar_api") {
      // Find all consecutive auto-generated points from the end
      let autoGeneratedCount = 0;
      for (let i = annotatedPoints.length - 1; i >= 0; i--) {
        if (annotatedPoints[i].src === "auto_similar_api") {
          autoGeneratedCount++;
        } else {
          break; // Stop when we hit a manually selected point
        }
      }

      // Remove all consecutive auto-generated points
      const pointsToRemove = annotatedPoints.slice(-autoGeneratedCount);
      const cellIndicesToRemove = pointsToRemove
        .map((p) => p.cellIndex)
        .filter((index) => index !== undefined);

      // Remove from autoSelectedCells
      setAutoSelectedCells((prev) => {
        const newSet = new Set(prev);
        cellIndicesToRemove.forEach((index) => newSet.delete(index));
        return newSet;
      });

      // Remove from previouslyGeneratedCandidates
      setPreviouslyGeneratedCandidates((prev) =>
        prev.filter(
          (candidate) => !cellIndicesToRemove.includes(candidate.cellIndex)
        )
      );

      // Remove from annotatedPoints
      setAnnotatedPoints((prev) => prev.slice(0, -autoGeneratedCount));

      console.log(`Undid ${autoGeneratedCount} auto-generated cells`);
    } else if (lastPoint.src === "manual") {
      // Remove single manual selection
      if (lastPoint.cellIndex !== undefined) {
        setUserSelectedCells((prev) => {
          const newSet = new Set(prev);
          newSet.delete(lastPoint.cellIndex);
          return newSet;
        });
      }
      setAnnotatedPoints((prev) => prev.slice(0, -1));
    }
  }, [annotatedPoints]);

  const saveAnnotation = useCallback(() => {
    if (selectedCells.size === 0) {
      toast.error("No cells selected to annotate.");
      return;
    }

    if (!selectedCellType) {
      toast.error("Please select a cell type.");
      return;
    }

    if (selectedCellType === "Others" && !cellTypeOther) {
      toast.error("Please specify the cell type.");
      return;
    }

    const cellType =
      selectedCellType === "Others" ? cellTypeOther : selectedCellType;
    const timestamp = new Date().toISOString();

    // Add all selected cells to annotated cells
    const newAnnotatedCells = Array.from(selectedCells).map((cellIndex) => ({
      cellIndex,
      cellType,
      timestamp,
    }));

    setAnnotatedCells((prev) => [...prev, ...newAnnotatedCells]);

    // Update counts
    setCellTypeCounts((prev) => ({
      ...prev,
      [cellType]: (prev[cellType] || 0) + selectedCells.size,
    }));

    // Clear selections
    setUserSelectedCells(new Set());
    setAutoSelectedCells(new Set());
    setAnnotatedPoints([]);
    setSelectedCellType("");
    setCellTypeOther("");
    setPreviouslyGeneratedCandidates([]); // Clear generated candidates after saving

    toast.success(
      `Successfully annotated ${selectedCells.size} cells as ${cellType}`
    );
  }, [selectedCells, selectedCellType, cellTypeOther]);

  const removeAnnotation = useCallback(
    (cellIndex) => {
      const annotation = annotatedCells.find((a) => a.cellIndex === cellIndex);
      if (!annotation) return;

      setAnnotatedCells((prev) =>
        prev.filter((a) => a.cellIndex !== cellIndex)
      );
      setCellTypeCounts((prev) => {
        const newCount = (prev[annotation.cellType] || 1) - 1;
        if (newCount <= 0) {
          // Remove the entry completely if count reaches 0
          const { [annotation.cellType]: removed, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [annotation.cellType]: newCount,
        };
      });
    },
    [annotatedCells]
  );

  const handleFinalSubmit = async () => {
    if (annotatedCells.length === 0) {
      toast.error("No cell annotations to submit.");
      return;
    }

    try {
      // Create CSV with annotated cells
      const rows = annotatedCells.map((annotation) => {
        const cell = cellPredictions[annotation.cellIndex];
        return {
          x0: cell.x0,
          y0: cell.y0,
          x1: cell.x1,
          y1: cell.y1,
          score: cell.score,
          label: annotation.cellType, // Use cell type as label
          poly_x: Array.isArray(cell.poly_x) ? cell.poly_x.join(",") : "",
          poly_y: Array.isArray(cell.poly_y) ? cell.poly_y.join(",") : "",
        };
      });

      const csvText = Papa.unparse(rows, {
        columns: ["x0", "y0", "x1", "y1", "score", "label", "poly_x", "poly_y"],
      });

      const csvBlob = new Blob([csvText], { type: "text/csv" });
      const csvFile = new File(
        [csvBlob],
        `annotations_${currentSlide.sample.job_id}.csv`,
        {
          type: "text/csv",
        }
      );

      const formData = new FormData();
      formData.append("job_id", currentSlide.sample.job_id);
      formData.append("annotations_csv", csvFile);
      formData.append("image_quality", true);
      formData.append("cellTypeCounts", JSON.stringify(cellTypeCounts));

      await axiosClient.post("/annotate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        `Successfully submitted ${annotatedCells.length} cell annotations.`
      );

      // Load next slide instead of navigating away
      loadNextSlide();
    } catch (error) {
      console.error("Failed to submit annotations:", error);
      toast.error("Failed to submit annotations. Please try again.");
    }
  };

  /* ---------------- Handle Final Patient Assessment ---------------- */
  const handleFinalPatientAssessment = async (assessmentData) => {
    try {
      await axiosClient.post(`/patient/${patientId}/complete`, assessmentData);
      toast.success("Patient annotation completed successfully!");
      navigate(ROUTES.PATHOLOGIST, { replace: true });
    } catch (error) {
      console.error("Error completing patient annotation:", error);
      toast.error("Failed to complete patient annotation. Please try again.");
    }
  };

  /* ---------------- Rendering ---------------- */

  if (loading) {
    return <LoadingScreen />;
  }

  // Show final assessment when all slides are completed
  if (allSlidesCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Final Patient Assessment
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                All slides have been annotated for Patient:{" "}
                {patientInfo?.user_typed_id}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <FinalAssessment
            patientId={patientId}
            onComplete={handleFinalPatientAssessment}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Cell Annotation Tool
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Patient: {patientInfo?.user_typed_id} | Selected:{" "}
              {selectedCells.size} cells | Annotated: {annotatedCells.length}{" "}
              cells
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Slide: {currentSlide?.sample?.job_id}
          </div>
        </div>
      </div>

      <div className="flex gap-6 p-6 h-[calc(100vh-88px)]">
        {/* Main annotation area */}
        <div
          className="flex-1 bg-white rounded-lg border border-gray-200 relative"
          ref={containerRef}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
            {!imageUrl && <div className="text-gray-500">Loading image...</div>}
            {imageUrl && (
              <AnnotationView
                imageUrl={imageUrl}
                imgSize={imgSize}
                getTransform={getTransform}
                onSvgClick={onSvgClick}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                svgRef={svgRef}
                panningRef={panningRef}
                cellPredictions={cellPredictions}
                selectedCells={selectedCells}
                annotatedCells={annotatedCells}
                toggleSelectCell={toggleSelectCell}
                pointSize={pointSize}
                pointColor={pointColor}
                annotatedPoints={annotatedPoints}
              />
            )}
          </div>

          {/* Freehand drawing overlay - renders on top of annotation view */}
          {freehandMode && imageUrl && (
            <FreehandAnnotator
              imgSrc={imageUrl}
              onSubmit={handleFreehandSubmit}
              minPoints={3}
              simplifyEpsilon={2}
              getTransform={getTransform}
              containerRef={containerRef}
            />
          )}
        </div>

        {/* Controls sidebar - Made scrollable with fixed height */}
        <div className="w-80 h-full overflow-y-auto">
          <div className="space-y-4 pb-4">
            {!showImageQualityCheck && (
              <>
                {/* Cell State Legend */}
                <CellStateLegend />

                {/* Cell Type Annotation */}
                <CellTypeAnnotation
                  selectedCells={selectedCells}
                  selectedCellType={selectedCellType}
                  setSelectedCellType={setSelectedCellType}
                  cellTypeOther={cellTypeOther}
                  setCellTypeOther={setCellTypeOther}
                  saveAnnotation={saveAnnotation}
                  cellTypeOptions={cellTypeOptions}
                />

                <AnnotatedCellsList
                  cellTypeCounts={cellTypeCounts}
                  annotatedCells={annotatedCells}
                  removeAnnotation={removeAnnotation}
                />

                {/* Actions - Hidden when image quality check is visible */}
                <AnnotationActions
                  selectedCells={selectedCells}
                  loadingAutoSelect={loadingAutoSelect}
                  runAutoSelectCumulative={() =>
                    runDynamicCellDetection("cumulative")
                  }
                  undoLast={undoLast}
                  clearAll={clearAll}
                  strictness={strictness}
                  setStrictness={setStrictness}
                />
                {/* Assessment Section - Replace with Next Slide button */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Slide Actions
                  </h3>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={annotatedCells.length === 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm mb-2"
                  >
                    Save & Next Slide
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Annotation will be saved and you'll move to the next slide
                  </p>
                </div>

                {/* Zoom controls */}
                <ZoomControls
                  zoom={zoom}
                  zoomByFactor={zoomByFactor}
                  fitToScreen={fitToScreen}
                />

                {/* Point appearance */}
                <AppearanceControls
                  pointSize={pointSize}
                  setPointSize={setPointSize}
                  pointColor={pointColor}
                  setPointColor={setPointColor}
                />

                {/* Statistics */}
                <StatisticsPanel
                  cellPredictions={cellPredictions}
                  selectedCells={selectedCells}
                  annotatedCells={annotatedCells}
                />

                {/* Freehand drawing toggle */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={freehandMode}
                      onChange={() => setFreehandMode((v) => !v)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Freehand Draw
                    </span>
                  </label>
                  <p className="text-xs text-gray-500">
                    Toggle to draw freehand polygons. After drawing, submit to
                    append to current predictions.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ImageQualityCheck
        showImageQualityCheck={showImageQualityCheck}
        handleImageQuality={handleImageQuality}
      />
    </div>
  );
}
