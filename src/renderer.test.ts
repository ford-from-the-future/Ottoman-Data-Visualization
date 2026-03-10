import { describe, it, expect } from 'vitest';
import { renderSvg } from './renderer.js';
import type { SceneGraph } from './types.js';

describe('renderSvg', () => {
  it('produces a valid SVG wrapper with viewBox', () => {
    const scene: SceneGraph = { width: 800, height: 600, elements: [] };
    const svg = renderSvg(scene);
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 800 600"');
    expect(svg).toContain('</svg>');
  });

  it('renders a line element', () => {
    const scene: SceneGraph = {
      width: 100,
      height: 100,
      elements: [
        { kind: 'line', start: { x: 0, y: 0 }, end: { x: 50, y: 50 }, strokeWidth: 2 },
      ],
    };
    const svg = renderSvg(scene);
    expect(svg).toContain('<line');
    expect(svg).toContain('x1="0"');
    expect(svg).toContain('stroke-width="2"');
  });

  it('renders a tapered line as a polygon', () => {
    const scene: SceneGraph = {
      width: 100,
      height: 100,
      elements: [
        {
          kind: 'line',
          start: { x: 0, y: 50 },
          end: { x: 100, y: 50 },
          strokeWidth: 4,
          strokeWidthEnd: 1,
        },
      ],
    };
    const svg = renderSvg(scene);
    expect(svg).toContain('<polygon');
    expect(svg).toContain('points=');
  });

  it('renders a circle element', () => {
    const scene: SceneGraph = {
      width: 100,
      height: 100,
      elements: [
        { kind: 'circle', center: { x: 50, y: 50 }, radius: 10, opacity: 0.5 },
      ],
    };
    const svg = renderSvg(scene);
    expect(svg).toContain('<circle');
    expect(svg).toContain('cx="50"');
    expect(svg).toContain('opacity="0.5"');
  });

  it('renders an arc element as a path', () => {
    const scene: SceneGraph = {
      width: 200,
      height: 200,
      elements: [
        {
          kind: 'arc',
          center: { x: 100, y: 100 },
          radius: 50,
          startAngle: 0,
          endAngle: 360,
          strokeWidth: 1,
        },
      ],
    };
    const svg = renderSvg(scene);
    expect(svg).toContain('<path');
    expect(svg).toContain('fill="none"');
  });

  it('renders a Bézier element as a path', () => {
    const scene: SceneGraph = {
      width: 100,
      height: 100,
      elements: [
        {
          kind: 'bezier',
          start: { x: 0, y: 50 },
          control: { x: 25, y: 0 },
          end: { x: 50, y: 50 },
          strokeWidth: 1.5,
        },
      ],
    };
    const svg = renderSvg(scene);
    expect(svg).toContain('<path');
    expect(svg).toContain('Q 25 0 50 50');
  });

  it('renders a rect element', () => {
    const scene: SceneGraph = {
      width: 100,
      height: 100,
      elements: [
        { kind: 'rect', origin: { x: 10, y: 20 }, width: 30, height: 40, opacity: 0.8 },
      ],
    };
    const svg = renderSvg(scene);
    expect(svg).toContain('<rect');
    expect(svg).toContain('x="10"');
    expect(svg).toContain('width="30"');
  });

  it('renders a text element with escaping', () => {
    const scene: SceneGraph = {
      width: 100,
      height: 100,
      elements: [
        {
          kind: 'text',
          position: { x: 10, y: 20 },
          content: 'A & B <C>',
          fontSize: 14,
          anchor: 'middle',
        },
      ],
    };
    const svg = renderSvg(scene);
    expect(svg).toContain('<text');
    expect(svg).toContain('A &amp; B &lt;C&gt;');
    expect(svg).toContain('text-anchor="middle"');
  });

  it('uses Ottoman-inspired font family in root SVG', () => {
    const scene: SceneGraph = { width: 100, height: 100, elements: [] };
    const svg = renderSvg(scene);
    expect(svg).toContain('Amiri');
  });
});
