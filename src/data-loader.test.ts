import { describe, it, expect } from 'vitest';
import { loadCsv, loadJson, loadData } from './data-loader.js';

describe('loadCsv', () => {
  it('parses a simple CSV with header row', () => {
    const csv = `name,value\nAlpha,10\nBeta,20\nGamma,30`;
    const result = loadCsv(csv);

    expect(result.fields).toEqual(['name', 'value']);
    expect(result.records).toHaveLength(3);
    expect(result.records[0]).toEqual({ name: 'Alpha', value: 10 });
    expect(result.records[2]).toEqual({ name: 'Gamma', value: 30 });
  });

  it('handles quoted fields containing commas', () => {
    const csv = `region,description\n"Istanbul, Turkey","A large city"\nAnkara,Capital`;
    const result = loadCsv(csv);

    expect(result.records[0]).toEqual({
      region: 'Istanbul, Turkey',
      description: 'A large city',
    });
  });

  it('coerces boolean and null values', () => {
    const csv = `name,active,notes\nA,true,\nB,false,some text`;
    const result = loadCsv(csv);

    expect(result.records[0]).toEqual({ name: 'A', active: true, notes: null });
    expect(result.records[1]).toEqual({ name: 'B', active: false, notes: 'some text' });
  });

  it('returns empty dataset for empty input', () => {
    const result = loadCsv('');
    expect(result.fields).toEqual([]);
    expect(result.records).toEqual([]);
  });

  it('handles Windows-style line endings', () => {
    const csv = "x,y\r\n1,2\r\n3,4";
    const result = loadCsv(csv);
    expect(result.records).toHaveLength(2);
    expect(result.records[0]).toEqual({ x: 1, y: 2 });
  });
});

describe('loadJson', () => {
  it('parses an array of objects', () => {
    const json = JSON.stringify([
      { region: 'East', count: 5 },
      { region: 'West', count: 12 },
    ]);
    const result = loadJson(json);

    expect(result.fields).toContain('region');
    expect(result.fields).toContain('count');
    expect(result.records).toHaveLength(2);
  });

  it('parses an object wrapping an array', () => {
    const json = JSON.stringify({
      data: [
        { a: 1 },
        { a: 2, b: 3 },
      ],
    });
    const result = loadJson(json);

    expect(result.fields).toContain('a');
    expect(result.fields).toContain('b');
    expect(result.records).toHaveLength(2);
  });

  it('throws for invalid JSON structures', () => {
    expect(() => loadJson('"just a string"')).toThrow();
    expect(() => loadJson('{"key": "no array"}')).toThrow();
  });

  it('returns empty dataset for empty array', () => {
    const result = loadJson('[]');
    expect(result.fields).toEqual([]);
    expect(result.records).toEqual([]);
  });
});

describe('loadData (auto-detect)', () => {
  it('detects JSON when input starts with "["', () => {
    const json = '[{"x":1}]';
    const result = loadData(json);
    expect(result.records[0]).toEqual({ x: 1 });
  });

  it('detects JSON when input starts with "{"', () => {
    const json = '{"rows":[{"x":2}]}';
    const result = loadData(json);
    expect(result.records[0]).toEqual({ x: 2 });
  });

  it('falls back to CSV', () => {
    const csv = 'a,b\n1,2';
    const result = loadData(csv);
    expect(result.fields).toEqual(['a', 'b']);
  });
});
