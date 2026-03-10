import { describe, it, expect } from 'vitest';
import { generateScene } from './engine.js';
import type { DataSet, VisualizationConfig, SceneGraph } from './types.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const sampleData: DataSet = {
  fields: ['category', 'value'],
  records: [
    { category: 'Alpha', value: 30 },
    { category: 'Beta', value: 50 },
    { category: 'Gamma', value: 20 },
    { category: 'Delta', value: 80 },
  ],
};

function countKind(scene: SceneGraph, kind: string): number {
  return scene.elements.filter((el) => el.kind === kind).length;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

describe('generateScene', () => {
  it('throws for an unknown Cerîde type', () => {
    expect(() =>
      generateScene(sampleData, {
        type: 'unknown' as never,
        mapping: { category: 'category', value: 'value' },
      }),
    ).toThrow('Unknown');
  });
});

// ---------------------------------------------------------------------------
// Radial
// ---------------------------------------------------------------------------

describe('Radial archetype', () => {
  const config: VisualizationConfig = {
    type: 'radial',
    mapping: { category: 'category', value: 'value' },
    title: 'Test Radial',
  };

  it('produces line elements for every data point', () => {
    const scene = generateScene(sampleData, config);
    // One tapered line per data item (rendered as polygon or line)
    expect(countKind(scene, 'line')).toBe(sampleData.records.length);
  });

  it('includes a central hub circle', () => {
    const scene = generateScene(sampleData, config);
    // Hub + terminal dots = 1 + n
    expect(countKind(scene, 'circle')).toBe(1 + sampleData.records.length);
  });

  it('includes text labels for every data point plus title', () => {
    const scene = generateScene(sampleData, config);
    // One label per spoke + title
    expect(countKind(scene, 'text')).toBe(sampleData.records.length + 1);
  });

  it('respects custom width and height', () => {
    const scene = generateScene(sampleData, { ...config, width: 400, height: 300 });
    expect(scene.width).toBe(400);
    expect(scene.height).toBe(300);
  });

  it('returns empty elements for empty data', () => {
    const empty: DataSet = { fields: ['category', 'value'], records: [] };
    const scene = generateScene(empty, config);
    expect(scene.elements).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Concentric
// ---------------------------------------------------------------------------

describe('Concentric archetype', () => {
  const config: VisualizationConfig = {
    type: 'concentric',
    mapping: { category: 'category', value: 'value' },
    title: 'Test Concentric',
  };

  it('produces arc elements for every data point', () => {
    const scene = generateScene(sampleData, config);
    // Main arcs + ghost arcs between them
    const arcs = countKind(scene, 'arc');
    expect(arcs).toBeGreaterThanOrEqual(sampleData.records.length);
  });

  it('generates ghost arcs between consecutive rings', () => {
    const scene = generateScene(sampleData, config);
    const ghostArcs = scene.elements.filter(
      (el) => el.kind === 'arc' && el.opacity !== undefined && el.opacity < 1,
    );
    // n-1 ghost arcs for n data items
    expect(ghostArcs).toHaveLength(sampleData.records.length - 1);
  });

  it('includes text labels with arcRadius set', () => {
    const scene = generateScene(sampleData, config);
    const textsWithArc = scene.elements.filter(
      (el) => el.kind === 'text' && 'arcRadius' in el && el.arcRadius,
    );
    expect(textsWithArc.length).toBe(sampleData.records.length);
  });
});

// ---------------------------------------------------------------------------
// Botanical
// ---------------------------------------------------------------------------

describe('Botanical archetype', () => {
  const config: VisualizationConfig = {
    type: 'botanical',
    mapping: { category: 'category', value: 'value' },
    title: 'Test Botanical',
  };

  it('produces Bézier elements (leaves) for every data point', () => {
    const scene = generateScene(sampleData, config);
    expect(countKind(scene, 'bezier')).toBe(sampleData.records.length);
  });

  it('produces a stem line', () => {
    const scene = generateScene(sampleData, config);
    expect(countKind(scene, 'line')).toBe(1);
  });

  it('generates deterministic output (seeded jitter)', () => {
    const scene1 = generateScene(sampleData, config);
    const scene2 = generateScene(sampleData, config);
    expect(scene1.elements).toEqual(scene2.elements);
  });
});

// ---------------------------------------------------------------------------
// Mirror
// ---------------------------------------------------------------------------

describe('Mirror archetype', () => {
  const mirrorData: DataSet = {
    fields: ['item', 'amount', 'direction'],
    records: [
      { item: 'A', amount: 40, direction: 'import' },
      { item: 'A', amount: 60, direction: 'export' },
      { item: 'B', amount: 30, direction: 'import' },
      { item: 'B', amount: 90, direction: 'export' },
    ],
  };

  const config: VisualizationConfig = {
    type: 'mirror',
    mapping: { category: 'item', value: 'amount', series: 'direction' },
    title: 'Trade Balance',
  };

  it('produces rect elements for left and right bars', () => {
    const scene = generateScene(mirrorData, config);
    // Two categories × 2 sides = 4 bars
    expect(countKind(scene, 'rect')).toBe(4);
  });

  it('draws a centre spine line', () => {
    const scene = generateScene(mirrorData, config);
    expect(countKind(scene, 'line')).toBe(1);
  });

  it('works without a series field (split by sign)', () => {
    const signedData: DataSet = {
      fields: ['item', 'amount'],
      records: [
        { item: 'X', amount: -20 },
        { item: 'Y', amount: 50 },
      ],
    };
    const noSeriesConfig: VisualizationConfig = {
      type: 'mirror',
      mapping: { category: 'item', value: 'amount' },
    };
    const scene = generateScene(signedData, noSeriesConfig);
    expect(scene.elements.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------

describe('Grid archetype', () => {
  const gridData: DataSet = {
    fields: ['region', 'quarter', 'cases'],
    records: [
      { region: 'East', quarter: 'Q1', cases: 10 },
      { region: 'East', quarter: 'Q2', cases: 30 },
      { region: 'West', quarter: 'Q1', cases: 50 },
      { region: 'West', quarter: 'Q2', cases: 20 },
    ],
  };

  const config: VisualizationConfig = {
    type: 'grid',
    mapping: { category: 'region', value: 'cases', series: 'quarter' },
    title: 'Regional Cases',
  };

  it('produces calligraphic dot circles for non-zero values', () => {
    const scene = generateScene(gridData, config);
    // 4 data dots + intersection dots
    const dataDots = scene.elements.filter(
      (el) => el.kind === 'circle' && el.radius > 1.5,
    );
    expect(dataDots).toHaveLength(4);
  });

  it('produces grid lines', () => {
    const scene = generateScene(gridData, config);
    const lines = countKind(scene, 'line');
    // horizontal: numRows + 1, vertical: numCols + 1
    expect(lines).toBe(3 + 3); // 2 rows + 1, 2 cols + 1
  });

  it('produces tapered intersection dots', () => {
    const scene = generateScene(gridData, config);
    const intersections = scene.elements.filter(
      (el) => el.kind === 'circle' && el.radius === 1.5,
    );
    // (numRows+1) * (numCols+1) = 3 * 3 = 9
    expect(intersections).toHaveLength(9);
  });
});
