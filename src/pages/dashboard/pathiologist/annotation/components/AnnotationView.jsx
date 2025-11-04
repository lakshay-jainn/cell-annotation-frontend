const AnnotationView = ({
  imageUrl,
  imgSize,
  getTransform,
  onSvgClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  svgRef,
  panningRef,
  cellPredictions,
  selectedCells,
  annotatedCells,
  toggleSelectCell,
  pointSize,
  pointColor,
  annotatedPoints,
}) => {
  if (!imageUrl || !imgSize[0] || !imgSize[1]) return null;

  const { scale, offsetX, offsetY } = getTransform();

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      onClick={onSvgClick}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onContextMenu={(ev) => ev.preventDefault()}
      style={{
        cursor: panningRef.current ? "grabbing" : "crosshair",
        touchAction: "none",
      }}
    >
      <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
      <g transform={`translate(${offsetX},${offsetY}) scale(${scale})`}>
        {/* Image */}
        <image
          href={imageUrl}
          x={0}
          y={0}
          width={imgSize[1]}
          height={imgSize[0]}
          preserveAspectRatio="none"
        />

        {/* Clickable areas, centroid dots, and boundary when selected */}
        {cellPredictions.map((cell, index) => {
          const bboxX = cell.x0;
          const bboxY = cell.y0;
          const bboxW = Math.max(0.0001, cell.x1 - cell.x0);
          const bboxH = Math.max(0.0001, cell.y1 - cell.y0);

          // polygon points string if available
          let polyPoints = null;
          if (
            Array.isArray(cell.poly_x) &&
            Array.isArray(cell.poly_y) &&
            cell.poly_x.length &&
            cell.poly_x.length === cell.poly_y.length
          ) {
            // poly_x = X coordinates (horizontal), poly_y = Y coordinates (vertical)
            // SVG format: "x,y x,y x,y"
            const pts = cell.poly_x.map((px, i) => `${px},${cell.poly_y[i]}`);
            polyPoints = pts.join(" ");
          }

          const isSelected = selectedCells.has(index);
          const isAnnotated = annotatedCells.some((a) => a.cellIndex === index);

          return (
            <g key={`cell-${index}`}>
              {/* Transparent bbox area captures clicks */}
              <rect
                x={bboxX}
                y={bboxY}
                width={bboxW}
                height={bboxH}
                fill="transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelectCell(index);
                }}
                style={{ cursor: isAnnotated ? "not-allowed" : "pointer" }}
              />

              {/* Centroid dot with color states: red (unselected), orange (selected), gray (disabled/annotated) */}
              <circle
                cx={cell.centroid.x}
                cy={cell.centroid.y}
                r={pointSize}
                fill={
                  isAnnotated
                    ? "#9ca3af" // Gray for disabled/annotated cells
                    : isSelected
                    ? "#008000" // Orange for selected cells
                    : "#ef4444" // Red for unselected cells
                }
                stroke="#008000"
                strokeWidth={0.8}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelectCell(index);
                }}
                style={{
                  cursor: isAnnotated ? "not-allowed" : "pointer",
                  opacity: isAnnotated ? 0.5 : 1,
                }}
              />

              {/* Outer boundary shown when selected: polygon if exists else bbox */}
              {isSelected && (
                <>
                  {polyPoints ? (
                    <polygon
                      points={polyPoints}
                      fill="none"
                      stroke={pointColor}
                      strokeWidth={1.2}
                      opacity={0.85}
                      pointerEvents="none"
                    />
                  ) : (
                    <rect
                      x={bboxX}
                      y={bboxY}
                      width={bboxW}
                      height={bboxH}
                      fill="none"
                      stroke={pointColor}
                      strokeWidth={1.2}
                      opacity={0.9}
                      pointerEvents="none"
                    />
                  )}
                </>
              )}
            </g>
          );
        })}

        {/* Labels for annotatedPoints (no pointer events) */}
        {annotatedPoints.map((point, index) => (
          <g
            key={`label-${index}`}
            transform={`translate(${point.x},${point.y})`}
            pointerEvents="none"
          >
            {/* Numbering removed as requested */}
          </g>
        ))}
      </g>
    </svg>
  );
};

export default AnnotationView;
