/**
 * Botanical Metaphor archetype (type: "botanical").
 *
 * Geometric logic: A non-linear "Organic Bar Chart" where data is mapped
 * to the height and curvature of quadratic Bézier curves.
 *
 * - Stem (Y-axis): Central trunk whose height represents the total aggregate.
 * - Leaves (X-axis): Individual data points sprout at intervals along the
 *   stem.  Leaf length scales with value.
 * - Symmetry jitter: A slight random offset in leaf placement so the graph
 *   looks "grown" rather than "rendered".
 */

import type {
  ArchetypeGenerator,
  DataSet,
  GeometryElement,
  SceneGraph,
  VisualizationConfig,
} from '../types.js';

/**
 * Simple seeded pseudo-random number generator (mulberry32).
 * Ensures deterministic jitter for the same dataset.
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class BotanicalGenerator implements ArchetypeGenerator {
  generate(data: DataSet, config: VisualizationConfig): SceneGraph {
    const width = config.width ?? 800;
    const height = config.height ?? 600;

    const elements: GeometryElement[] = [];

    const { category, value } = config.mapping;
    const items = data.records.map((r) => ({
      label: String(r[category] ?? ''),
      value: Number(r[value] ?? 0),
    }));

    const n = items.length;
    if (n === 0) return { width, height, elements };

    const maxValue = Math.max(...items.map((i) => i.value), 1);
    const totalValue = items.reduce((sum, i) => sum + i.value, 0);

    // Stem parameters
    const stemX = width / 2;
    const stemBottom = height - 40;
    const stemTop = 50;
    const stemHeight = stemBottom - stemTop;

    // Scale stem height proportionally to total (capped at canvas)
    const trunkHeight = Math.min(stemHeight, stemHeight * (totalValue / (maxValue * n)));

    const trunkTop = stemBottom - trunkHeight;

    // Draw the central stem (trunk)
    elements.push({
      kind: 'line',
      start: { x: stemX, y: stemBottom },
      end: { x: stemX, y: trunkTop },
      strokeWidth: 3,
    });

    // Deterministic jitter
    const rng = seededRandom(42);

    // Place leaves along the stem
    const leafSpacing = trunkHeight / (n + 1);
    const maxLeafLength = (width / 2) - 80;

    for (let i = 0; i < n; i++) {
      const normValue = items[i].value / maxValue;
      const leafLength = normValue * maxLeafLength;

      // Alternate sides with symmetry jitter
      const side = i % 2 === 0 ? 1 : -1;
      const jitterY = (rng() - 0.5) * leafSpacing * 0.3;
      const jitterCurve = (rng() - 0.5) * 20;

      const attachY = stemBottom - leafSpacing * (i + 1) + jitterY;
      const leafEndX = stemX + side * leafLength;
      const controlX = stemX + side * leafLength * 0.6;
      const controlY = attachY - 20 + jitterCurve;

      // Leaf as a Bézier curve
      elements.push({
        kind: 'bezier',
        start: { x: stemX, y: attachY },
        control: { x: controlX, y: controlY },
        end: { x: leafEndX, y: attachY + 5 },
        strokeWidth: 1.5,
      });

      // Label at the tip of the leaf
      elements.push({
        kind: 'text',
        position: { x: leafEndX + side * 6, y: attachY + 5 },
        content: `${items[i].label} (${items[i].value})`,
        fontSize: 10,
        anchor: side > 0 ? 'start' : 'end',
      });
    }

    // Title at the top
    if (config.title) {
      elements.push({
        kind: 'text',
        position: { x: stemX, y: trunkTop - 16 },
        content: config.title,
        fontSize: 13,
        anchor: 'middle',
      });
    }

    return { width, height, elements };
  }
}
