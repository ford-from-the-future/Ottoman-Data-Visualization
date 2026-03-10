/**
 * Core type definitions for the Ottoman Data Visualization framework.
 *
 * Defines the data schemas, visualization configuration interfaces,
 * and geometry primitives used across all Cerîde archetypes.
 */

// ---------------------------------------------------------------------------
// Data ingestion types
// ---------------------------------------------------------------------------

/** A single row of user-supplied data, represented as key-value pairs. */
export type DataRecord = Record<string, string | number | boolean | null>;

/** The result of loading and parsing a user-supplied dataset. */
export interface DataSet {
  /** Column/field names inferred from the data source. */
  fields: string[];
  /** The parsed rows of data. */
  records: DataRecord[];
}

// ---------------------------------------------------------------------------
// Visualization configuration
// ---------------------------------------------------------------------------

/** The five supported Cerîde visualization archetypes. */
export type CerideType = 'radial' | 'concentric' | 'botanical' | 'mirror' | 'grid';

/**
 * Maps user-supplied field names to the roles expected by a given archetype.
 *
 * Each archetype interprets these mappings differently:
 * - `category` — the field used for labelling / angular distribution.
 * - `value`    — the primary numeric field driving size / radius / length.
 * - `series`   — optional secondary grouping (e.g. time-steps, left/right).
 */
export interface FieldMapping {
  category: string;
  value: string;
  series?: string;
}

/** Top-level configuration object handed to the engine. */
export interface VisualizationConfig {
  type: CerideType;
  mapping: FieldMapping;
  /** Width of the SVG canvas in pixels (default 800). */
  width?: number;
  /** Height of the SVG canvas in pixels (default 600). */
  height?: number;
  /** Optional title rendered at the centre / top of the visualisation. */
  title?: string;
}

// ---------------------------------------------------------------------------
// Geometry primitives — archetype-agnostic building blocks
// ---------------------------------------------------------------------------

export interface Point {
  x: number;
  y: number;
}

/** A straight line segment with optional stroke styling. */
export interface LineElement {
  kind: 'line';
  start: Point;
  end: Point;
  strokeWidth: number;
  /** End stroke width for tapered lines (defaults to strokeWidth). */
  strokeWidthEnd?: number;
}

/** A full or partial circle / arc. */
export interface ArcElement {
  kind: 'arc';
  center: Point;
  radius: number;
  startAngle: number;
  endAngle: number;
  strokeWidth: number;
  opacity?: number;
}

/** A circle (filled dot / marker). */
export interface CircleElement {
  kind: 'circle';
  center: Point;
  radius: number;
  opacity?: number;
}

/** A quadratic Bézier curve. */
export interface BezierElement {
  kind: 'bezier';
  start: Point;
  control: Point;
  end: Point;
  strokeWidth: number;
}

/** A rectangle. */
export interface RectElement {
  kind: 'rect';
  origin: Point;
  width: number;
  height: number;
  opacity?: number;
}

/** A text label. */
export interface TextElement {
  kind: 'text';
  position: Point;
  content: string;
  fontSize?: number;
  anchor?: 'start' | 'middle' | 'end';
  rotation?: number;
  /** If set, text follows an arc path with this radius. */
  arcRadius?: number;
}

/** Union type covering every geometry primitive the renderer understands. */
export type GeometryElement =
  | LineElement
  | ArcElement
  | CircleElement
  | BezierElement
  | RectElement
  | TextElement;

/** The complete output of an archetype generator. */
export interface SceneGraph {
  width: number;
  height: number;
  elements: GeometryElement[];
}

/** Interface every archetype generator must implement. */
export interface ArchetypeGenerator {
  generate(data: DataSet, config: VisualizationConfig): SceneGraph;
}
