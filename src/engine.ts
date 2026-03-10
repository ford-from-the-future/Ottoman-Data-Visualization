/**
 * Core engine for the Ottoman Data Visualization framework.
 *
 * Given a {@link DataSet} and a {@link VisualizationConfig}, the engine
 * selects the appropriate archetype generator and produces a
 * {@link SceneGraph} of geometry primitives ready for rendering.
 */

import type {
  ArchetypeGenerator,
  CerideType,
  DataSet,
  SceneGraph,
  VisualizationConfig,
} from './types.js';
import {
  RadialGenerator,
  ConcentricGenerator,
  BotanicalGenerator,
  MirrorGenerator,
  GridGenerator,
} from './archetypes/index.js';

/** Registry of built-in archetype generators keyed by their Cerîde type. */
const generators: Record<CerideType, ArchetypeGenerator> = {
  radial: new RadialGenerator(),
  concentric: new ConcentricGenerator(),
  botanical: new BotanicalGenerator(),
  mirror: new MirrorGenerator(),
  grid: new GridGenerator(),
};

/**
 * Generate a scene graph for the given data and configuration.
 *
 * This is the primary entry-point of the engine:
 *
 * ```ts
 * import { loadData } from './data-loader';
 * import { generateScene } from './engine';
 *
 * const data = loadData(rawCsvOrJson);
 * const scene = generateScene(data, {
 *   type: 'radial',
 *   mapping: { category: 'region', value: 'cases' },
 * });
 * ```
 *
 * @param data   - The normalised dataset (output of {@link loadData}).
 * @param config - Selects the Cerîde type and field mapping.
 * @returns A {@link SceneGraph} of geometry elements.
 */
export function generateScene(
  data: DataSet,
  config: VisualizationConfig,
): SceneGraph {
  const generator = generators[config.type];
  if (!generator) {
    throw new Error(`Unknown Cerîde type: "${config.type}"`);
  }
  return generator.generate(data, config);
}
