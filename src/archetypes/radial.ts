/**
 * Radial Hub archetype (type: "radial").
 *
 * Geometric logic: Data points are mapped to polar coordinates (θ, r).
 * The origin is reserved for a central hub (title / seal).
 *
 * - Angle (θ): 360° / n evenly distributed, with optional elliptical stretch.
 * - Length (r): Proportional to the numerical value.
 * - Stroke Rule: Tapered strokes — thick at origin, thin (0.5 pt) at terminal.
 */

import type {
  ArchetypeGenerator,
  DataSet,
  GeometryElement,
  SceneGraph,
  VisualizationConfig,
} from '../types.js';

export class RadialGenerator implements ArchetypeGenerator {
  generate(data: DataSet, config: VisualizationConfig): SceneGraph {
    const width = config.width ?? 800;
    const height = config.height ?? 600;
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 60; // leave room for labels

    const elements: GeometryElement[] = [];

    // Extract category/value pairs
    const { category, value } = config.mapping;
    const items = data.records.map((r) => ({
      label: String(r[category] ?? ''),
      value: Number(r[value] ?? 0),
    }));

    const n = items.length;
    if (n === 0) return { width, height, elements };

    const maxValue = Math.max(...items.map((i) => i.value), 1);

    // Central hub circle
    elements.push({
      kind: 'circle',
      center: { x: cx, y: cy },
      radius: 18,
      opacity: 1,
    });

    // Hub title
    if (config.title) {
      elements.push({
        kind: 'text',
        position: { x: cx, y: cy },
        content: config.title,
        fontSize: 10,
        anchor: 'middle',
      });
    }

    // Radial spokes
    const angleStep = (2 * Math.PI) / n;

    for (let i = 0; i < n; i++) {
      const theta = angleStep * i - Math.PI / 2; // start at top
      const r = (items[i].value / maxValue) * maxRadius;

      // Elliptical stretch: r varies by sin(θ) to create ovals
      const ellipticalR = r * (0.85 + 0.15 * Math.abs(Math.sin(theta)));

      const endX = cx + ellipticalR * Math.cos(theta);
      const endY = cy + ellipticalR * Math.sin(theta);

      // Tapered stroke line: thick at origin (2.5), thin at terminal (0.5)
      elements.push({
        kind: 'line',
        start: { x: cx, y: cy },
        end: { x: endX, y: endY },
        strokeWidth: 2.5,
        strokeWidthEnd: 0.5,
      });

      // Terminal dot
      elements.push({
        kind: 'circle',
        center: { x: endX, y: endY },
        radius: 3,
        opacity: 1,
      });

      // Label at the end of the spoke
      const labelR = ellipticalR + 14;
      const labelX = cx + labelR * Math.cos(theta);
      const labelY = cy + labelR * Math.sin(theta);

      const anchor =
        Math.abs(Math.cos(theta)) < 0.01
          ? 'middle' as const
          : Math.cos(theta) > 0
            ? 'start' as const
            : 'end' as const;

      elements.push({
        kind: 'text',
        position: { x: labelX, y: labelY },
        content: `${items[i].label} (${items[i].value})`,
        fontSize: 11,
        anchor,
      });
    }

    return { width, height, elements };
  }
}
