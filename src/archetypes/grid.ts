/**
 * Tapered Grid archetype (type: "grid").
 *
 * Geometric logic: A Cartesian grid (X, Y) where values are represented by
 * the density or size of a marker rather than height.
 *
 * - "Calligraphic Dots": Higher values produce larger / more opaque ink
 *   clusters instead of standard heatmap blocks.
 * - Tapered intersections: Grid lines slightly thicken where they cross,
 *   mimicking hand-inked borders.
 */

import type {
  ArchetypeGenerator,
  DataSet,
  GeometryElement,
  SceneGraph,
  VisualizationConfig,
} from '../types.js';

export class GridGenerator implements ArchetypeGenerator {
  generate(data: DataSet, config: VisualizationConfig): SceneGraph {
    const width = config.width ?? 800;
    const height = config.height ?? 600;

    const elements: GeometryElement[] = [];

    const { category, value, series } = config.mapping;

    // Determine unique categories (rows) and series (columns)
    const categories = Array.from(
      new Set(data.records.map((r) => String(r[category] ?? ''))),
    );
    const seriesValues = series
      ? Array.from(new Set(data.records.map((r) => String(r[series] ?? ''))))
      : ['value'];

    const numRows = categories.length;
    const numCols = seriesValues.length;

    if (numRows === 0 || numCols === 0) return { width, height, elements };

    // Build value matrix
    const matrix: number[][] = Array.from({ length: numRows }, () =>
      Array(numCols).fill(0) as number[],
    );

    for (const r of data.records) {
      const cat = String(r[category] ?? '');
      const val = Number(r[value] ?? 0);
      const ser = series ? String(r[series] ?? '') : 'value';
      const ri = categories.indexOf(cat);
      const ci = seriesValues.indexOf(ser);
      if (ri >= 0 && ci >= 0) matrix[ri][ci] = val;
    }

    const maxVal = Math.max(...matrix.flat(), 1);

    // Grid layout constants
    const marginLeft = 100;
    const marginTop = 60;
    const marginRight = 40;
    const marginBottom = 40;
    const gridWidth = width - marginLeft - marginRight;
    const gridHeight = height - marginTop - marginBottom;
    const cellW = gridWidth / numCols;
    const cellH = gridHeight / numRows;
    const maxDotRadius = Math.min(cellW, cellH) / 2 - 2;

    // Title
    if (config.title) {
      elements.push({
        kind: 'text',
        position: { x: width / 2, y: marginTop - 30 },
        content: config.title,
        fontSize: 14,
        anchor: 'middle',
      });
    }

    // Draw grid lines with tapered intersections --------------------------
    // Horizontal lines
    for (let row = 0; row <= numRows; row++) {
      const y = marginTop + cellH * row;
      elements.push({
        kind: 'line',
        start: { x: marginLeft, y },
        end: { x: marginLeft + gridWidth, y },
        strokeWidth: 0.5,
      });
    }

    // Vertical lines
    for (let col = 0; col <= numCols; col++) {
      const x = marginLeft + cellW * col;
      elements.push({
        kind: 'line',
        start: { x, y: marginTop },
        end: { x, y: marginTop + gridHeight },
        strokeWidth: 0.5,
      });
    }

    // Tapered intersections — small dots where grid lines cross
    for (let row = 0; row <= numRows; row++) {
      for (let col = 0; col <= numCols; col++) {
        elements.push({
          kind: 'circle',
          center: {
            x: marginLeft + cellW * col,
            y: marginTop + cellH * row,
          },
          radius: 1.5,
          opacity: 0.6,
        });
      }
    }

    // Calligraphic dots for data values -----------------------------------
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const val = matrix[row][col];
        if (val <= 0) continue;
        const norm = val / maxVal;
        const dotRadius = Math.max(2, norm * maxDotRadius);

        elements.push({
          kind: 'circle',
          center: {
            x: marginLeft + cellW * col + cellW / 2,
            y: marginTop + cellH * row + cellH / 2,
          },
          radius: dotRadius,
          opacity: 0.3 + 0.7 * norm,
        });
      }
    }

    // Row labels (categories)
    for (let row = 0; row < numRows; row++) {
      elements.push({
        kind: 'text',
        position: {
          x: marginLeft - 8,
          y: marginTop + cellH * row + cellH / 2 + 4,
        },
        content: categories[row],
        fontSize: 10,
        anchor: 'end',
      });
    }

    // Column labels (series)
    for (let col = 0; col < numCols; col++) {
      elements.push({
        kind: 'text',
        position: {
          x: marginLeft + cellW * col + cellW / 2,
          y: marginTop - 8,
        },
        content: seriesValues[col],
        fontSize: 10,
        anchor: 'middle',
      });
    }

    return { width, height, elements };
  }
}
