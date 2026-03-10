/**
 * SVG renderer for the Ottoman Data Visualization framework.
 *
 * Converts a {@link SceneGraph} of geometry primitives into an SVG string
 * suitable for embedding in HTML or saving to a file.
 */

import type {
  ArcElement,
  BezierElement,
  CircleElement,
  GeometryElement,
  LineElement,
  RectElement,
  SceneGraph,
  TextElement,
} from './types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Convert degrees to radians. */
function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Build an SVG arc path string.
 *
 * Full circles (360°) are split into two arcs to avoid the degenerate-path
 * problem in SVG arc commands.
 */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  if (Math.abs(endDeg - startDeg) >= 360) {
    // Full circle — split into two semicircles
    const x1 = cx + r;
    const y1 = cy;
    const x2 = cx - r;
    const y2 = cy;
    return [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 1 1 ${x2} ${y2}`,
      `A ${r} ${r} 0 1 1 ${x1} ${y1}`,
      'Z',
    ].join(' ');
  }

  const startRad = deg2rad(startDeg - 90); // rotate so 0° is top
  const endRad = deg2rad(endDeg - 90);
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

// ---------------------------------------------------------------------------
// Element renderers
// ---------------------------------------------------------------------------

function renderLine(el: LineElement, id: number): string {
  if (el.strokeWidthEnd !== undefined && el.strokeWidthEnd !== el.strokeWidth) {
    // Tapered stroke → use a polygon that widens from end to start
    const dx = el.end.x - el.start.x;
    const dy = el.end.y - el.start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return '';
    const nx = -dy / len;
    const ny = dx / len;

    const halfStart = el.strokeWidth / 2;
    const halfEnd = el.strokeWidthEnd / 2;

    const x1 = el.start.x + nx * halfStart;
    const y1 = el.start.y + ny * halfStart;
    const x2 = el.start.x - nx * halfStart;
    const y2 = el.start.y - ny * halfStart;
    const x3 = el.end.x - nx * halfEnd;
    const y3 = el.end.y - ny * halfEnd;
    const x4 = el.end.x + nx * halfEnd;
    const y4 = el.end.y + ny * halfEnd;

    return `<polygon id="el-${id}" points="${x1},${y1} ${x4},${y4} ${x3},${y3} ${x2},${y2}" fill="currentColor"/>`;
  }

  return `<line id="el-${id}" x1="${el.start.x}" y1="${el.start.y}" x2="${el.end.x}" y2="${el.end.y}" stroke="currentColor" stroke-width="${el.strokeWidth}"/>`;
}

function renderArc(el: ArcElement, id: number): string {
  const opacity = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
  const d = arcPath(el.center.x, el.center.y, el.radius, el.startAngle, el.endAngle);
  return `<path id="el-${id}" d="${d}" fill="none" stroke="currentColor" stroke-width="${el.strokeWidth}"${opacity}/>`;
}

function renderCircle(el: CircleElement, id: number): string {
  const opacity = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
  return `<circle id="el-${id}" cx="${el.center.x}" cy="${el.center.y}" r="${el.radius}" fill="currentColor"${opacity}/>`;
}

function renderBezier(el: BezierElement, id: number): string {
  const d = `M ${el.start.x} ${el.start.y} Q ${el.control.x} ${el.control.y} ${el.end.x} ${el.end.y}`;
  return `<path id="el-${id}" d="${d}" fill="none" stroke="currentColor" stroke-width="${el.strokeWidth}"/>`;
}

function renderRect(el: RectElement, id: number): string {
  const opacity = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
  return `<rect id="el-${id}" x="${el.origin.x}" y="${el.origin.y}" width="${el.width}" height="${el.height}" fill="currentColor"${opacity}/>`;
}

function renderText(el: TextElement, id: number): string {
  const anchor = el.anchor ?? 'start';
  const fontSize = el.fontSize ?? 12;
  const rotation = el.rotation ? ` transform="rotate(${el.rotation} ${el.position.x} ${el.position.y})"` : '';
  return `<text id="el-${id}" x="${el.position.x}" y="${el.position.y}" font-size="${fontSize}" text-anchor="${anchor}" fill="currentColor"${rotation}>${escapeXml(el.content)}</text>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function renderElement(el: GeometryElement, id: number): string {
  switch (el.kind) {
    case 'line':
      return renderLine(el, id);
    case 'arc':
      return renderArc(el, id);
    case 'circle':
      return renderCircle(el, id);
    case 'bezier':
      return renderBezier(el, id);
    case 'rect':
      return renderRect(el, id);
    case 'text':
      return renderText(el, id);
  }
}

/**
 * Render a {@link SceneGraph} to an SVG string.
 *
 * @param scene - The scene graph produced by the engine.
 * @returns A self-contained SVG document as a string.
 */
export function renderSvg(scene: SceneGraph): string {
  const body = scene.elements
    .map((el, i) => `  ${renderElement(el, i)}`)
    .join('\n');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${scene.width} ${scene.height}" width="${scene.width}" height="${scene.height}" style="color:#2c1810;font-family:'Amiri','Noto Naskh Arabic',serif">`,
    body,
    '</svg>',
  ].join('\n');
}
