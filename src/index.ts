/**
 * Ottoman Data Visualization — public API.
 *
 * This module re-exports everything needed to load data, generate geometry,
 * and render SVG output in the style of the Cerîde-i Adliyye.
 *
 * Typical usage:
 *
 * ```ts
 * import { loadData, generateScene, renderSvg } from 'ottoman-data-visualization';
 *
 * const data = loadData(rawCsvOrJson);
 * const scene = generateScene(data, {
 *   type: 'radial',
 *   mapping: { category: 'region', value: 'count' },
 * });
 * const svg = renderSvg(scene);
 * ```
 */

export { loadCsv, loadJson, loadData } from './data-loader.js';
export { generateScene } from './engine.js';
export { renderSvg } from './renderer.js';

export type {
  DataRecord,
  DataSet,
  CerideType,
  FieldMapping,
  VisualizationConfig,
  Point,
  LineElement,
  ArcElement,
  CircleElement,
  BezierElement,
  RectElement,
  TextElement,
  GeometryElement,
  SceneGraph,
  ArchetypeGenerator,
} from './types.js';
