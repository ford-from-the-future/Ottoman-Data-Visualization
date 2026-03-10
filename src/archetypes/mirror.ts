/**
 * Mirror Symmetry archetype (type: "mirror").
 *
 * Geometric logic: A bilateral bar chart mirrored across a central vertical
 * axis (X = 0).
 *
 * - Left side (negative X): "Outgoing" / "Imports" / first series value.
 * - Right side (positive X): "Incoming" / "Exports" / second series value.
 * - Centre spine: Hosts the category labels.
 * - Mass balance: Total width is normalised so the heavier side is
 *   immediately apparent.
 */

import type {
  ArchetypeGenerator,
  DataSet,
  GeometryElement,
  SceneGraph,
  VisualizationConfig,
} from '../types.js';

interface MirrorItem {
  label: string;
  left: number;
  right: number;
}

export class MirrorGenerator implements ArchetypeGenerator {
  generate(data: DataSet, config: VisualizationConfig): SceneGraph {
    const width = config.width ?? 800;
    const height = config.height ?? 600;

    const elements: GeometryElement[] = [];

    const { category, value, series } = config.mapping;

    // Build mirror items ---------------------------------------------------
    let items: MirrorItem[];

    if (series) {
      // Group by category; first unique series value → left, second → right
      const seriesValues = Array.from(
        new Set(data.records.map((r) => String(r[series] ?? ''))),
      );
      const leftSeries = seriesValues[0] ?? '';
      const rightSeries = seriesValues[1] ?? '';

      const grouped = new Map<string, MirrorItem>();
      for (const r of data.records) {
        const cat = String(r[category] ?? '');
        const val = Number(r[value] ?? 0);
        const s = String(r[series] ?? '');
        if (!grouped.has(cat)) {
          grouped.set(cat, { label: cat, left: 0, right: 0 });
        }
        const item = grouped.get(cat)!;
        if (s === leftSeries) item.left = val;
        else if (s === rightSeries) item.right = val;
      }

      items = Array.from(grouped.values());
    } else {
      // Without a series field, mirror each record against zero
      items = data.records.map((r) => {
        const val = Number(r[value] ?? 0);
        return {
          label: String(r[category] ?? ''),
          left: val < 0 ? Math.abs(val) : 0,
          right: val >= 0 ? val : 0,
        };
      });
    }

    const n = items.length;
    if (n === 0) return { width, height, elements };

    const maxVal = Math.max(
      ...items.map((i) => i.left),
      ...items.map((i) => i.right),
      1,
    );

    // Layout constants
    const marginTop = 60;
    const marginBottom = 30;
    const spineX = width / 2;
    const barMaxWidth = (width / 2) - 80;
    const availableHeight = height - marginTop - marginBottom;
    const barHeight = Math.min(30, availableHeight / n - 4);
    const barSpacing = availableHeight / n;

    // Centre spine
    elements.push({
      kind: 'line',
      start: { x: spineX, y: marginTop - 10 },
      end: { x: spineX, y: height - marginBottom + 10 },
      strokeWidth: 1.5,
    });

    // Title
    if (config.title) {
      elements.push({
        kind: 'text',
        position: { x: spineX, y: marginTop - 30 },
        content: config.title,
        fontSize: 14,
        anchor: 'middle',
      });
    }

    for (let i = 0; i < n; i++) {
      const y = marginTop + barSpacing * i + barSpacing / 2;

      const leftWidth = (items[i].left / maxVal) * barMaxWidth;
      const rightWidth = (items[i].right / maxVal) * barMaxWidth;

      // Left bar
      if (leftWidth > 0) {
        elements.push({
          kind: 'rect',
          origin: { x: spineX - leftWidth, y: y - barHeight / 2 },
          width: leftWidth,
          height: barHeight,
          opacity: 0.8,
        });
      }

      // Right bar
      if (rightWidth > 0) {
        elements.push({
          kind: 'rect',
          origin: { x: spineX, y: y - barHeight / 2 },
          width: rightWidth,
          height: barHeight,
          opacity: 0.8,
        });
      }

      // Category label on the spine
      elements.push({
        kind: 'text',
        position: { x: spineX, y: y + 4 },
        content: items[i].label,
        fontSize: 10,
        anchor: 'middle',
      });
    }

    return { width, height, elements };
  }
}
