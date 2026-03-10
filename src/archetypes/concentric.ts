/**
 * Concentric Chronology archetype (type: "concentric").
 *
 * Geometric logic: Nested arcs or full circles where each ring represents
 * a time-step or series value.
 *
 * - Inner circle: Static base radius (Rbase) for the baseline entry.
 * - Outer rings: Rn = Rbase + normalised value.
 * - Ghost arcs: Low-opacity strokes showing the delta between rings.
 * - Labels follow the arc path (text-on-path).
 */

import type {
  ArchetypeGenerator,
  DataSet,
  GeometryElement,
  SceneGraph,
  VisualizationConfig,
} from '../types.js';

export class ConcentricGenerator implements ArchetypeGenerator {
  generate(data: DataSet, config: VisualizationConfig): SceneGraph {
    const width = config.width ?? 800;
    const height = config.height ?? 600;
    const cx = width / 2;
    const cy = height / 2;

    const elements: GeometryElement[] = [];

    const { category, value } = config.mapping;
    const items = data.records.map((r) => ({
      label: String(r[category] ?? ''),
      value: Number(r[value] ?? 0),
    }));

    const n = items.length;
    if (n === 0) return { width, height, elements };

    const maxValue = Math.max(...items.map((i) => i.value), 1);
    const rBase = 40;
    const rMax = Math.min(width, height) / 2 - 50;
    const rRange = rMax - rBase;

    // Title at centre
    if (config.title) {
      elements.push({
        kind: 'text',
        position: { x: cx, y: cy },
        content: config.title,
        fontSize: 12,
        anchor: 'middle',
      });
    }

    for (let i = 0; i < n; i++) {
      const normValue = items[i].value / maxValue;
      const radius = rBase + normValue * rRange;

      // Main ring
      elements.push({
        kind: 'arc',
        center: { x: cx, y: cy },
        radius,
        startAngle: 0,
        endAngle: 360,
        strokeWidth: 1.5,
        opacity: 1,
      });

      // Ghost arc showing delta to next ring (if there is one)
      if (i < n - 1) {
        const nextNorm = items[i + 1].value / maxValue;
        const nextRadius = rBase + nextNorm * rRange;
        const ghostRadius = (radius + nextRadius) / 2;

        elements.push({
          kind: 'arc',
          center: { x: cx, y: cy },
          radius: ghostRadius,
          startAngle: 0,
          endAngle: 360,
          strokeWidth: 0.5,
          opacity: 0.25,
        });
      }

      // Label on the arc (text-on-path approximation: placed at top of ring)
      elements.push({
        kind: 'text',
        position: { x: cx, y: cy - radius - 4 },
        content: `${items[i].label} (${items[i].value})`,
        fontSize: 10,
        anchor: 'middle',
        arcRadius: radius,
      });
    }

    return { width, height, elements };
  }
}
