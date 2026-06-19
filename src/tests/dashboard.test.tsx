/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { widgetRegistry } from '../registry/widgetRegistry';
import { BarTransformer, LineTransformer, TreemapTransformer, ScatterTransformer } from '../utils/transformers';
import { BarChartDataSchema, LineChartDataSchema, TreemapDataSchema } from '../../server/schemas/chartSchemas';
import { BarWidget } from '../widgets/BarWidget';

describe('Scalable Dashboard Builder Core Tests', () => {
  beforeEach(() => {
    widgetRegistry.clearRegistry();
  });

  // ==========================================
  // TEST SUITE 1: REGISTRY ENGINE LOOKUPS
  // ==========================================
  describe('Widget Registry Module', () => {
    it('should register and retrieve widgets successfully', () => {
      widgetRegistry.registerWidget({
        type: 'mock-bar',
        displayName: 'Mock Bar',
        description: 'Test Description',
        schema: BarChartDataSchema,
        transformer: new BarTransformer(),
        mockGenerator: () => ({ categories: ['A'], values: [10] }),
        component: BarWidget,
      });

      expect(widgetRegistry.has('mock-bar') || widgetRegistry.getWidget('mock-bar')).toBeDefined();
      const loaded = widgetRegistry.getWidget('mock-bar');
      expect(loaded?.displayName).toBe('Mock Bar');
      expect(loaded?.type).toBe('mock-bar');
    });

    it('should return all registered entries in list catalog', () => {
      widgetRegistry.registerWidget({
        type: 'dummy-1',
        displayName: 'Dummy 1',
        description: 'First',
        schema: BarChartDataSchema,
        transformer: new BarTransformer(),
        mockGenerator: () => ({ categories: ['A'], values: [1] }),
        component: BarWidget,
      });

      widgetRegistry.registerWidget({
        type: 'dummy-2',
        displayName: 'Dummy 2',
        description: 'Second',
        schema: BarChartDataSchema,
        transformer: new BarTransformer(),
        mockGenerator: () => ({ categories: ['B'], values: [2] }),
        component: BarWidget,
      });

      const list = widgetRegistry.getAllWidgets();
      expect(list.length).toBe(2);
      expect(list.some(item => item.type === 'dummy-1')).toBe(true);
      expect(list.some(item => item.type === 'dummy-2')).toBe(true);
    });
  });

  // ==========================================
  // TEST SUITE 2: FORMAT TRANSFORMERS
  // ==========================================
  describe('Data Format Transformers', () => {
    it('BarTransformer should map categories & arrays into ECharts values smoothly', () => {
      const transformer = new BarTransformer();
      const dummyInput = { categories: ['Jan', 'Feb'], values: [15, 30] };
      const out = transformer.transform(dummyInput);

      expect(out.xAxis.data).toEqual(['Jan', 'Feb']);
      expect(out.series[0].data).toEqual([15, 30]);
      expect(out.series[0].type).toBe('bar');
    });

    it('LineTransformer should sort time sequence chronologically', () => {
      const transformer = new LineTransformer();
      const dummyInput = {
        points: [
          { timestamp: '2026-02-01T00:00:00Z', value: 80 },
          { timestamp: '2026-01-01T00:00:00Z', value: 40 },
          { timestamp: '2026-03-01T00:00:00Z', value: 120 },
        ],
      };
      const out = transformer.transform(dummyInput);

      // Verify sorted chronological outputs
      expect(out.series[0].data).toEqual([40, 80, 120]);
    });

    it('TreemapTransformer should convert recursive hierarchy structures', () => {
      const transformer = new TreemapTransformer();
      const dummyInput = {
        name: 'GrandParent',
        children: [
          {
            name: 'ParentA',
            children: [{ name: 'ChildA1', value: 100 }],
          },
        ],
      };
      const out = transformer.transform(dummyInput);

      expect(out.series[0].name).toBe('GrandParent');
      expect(out.series[0].data[0].name).toBe('ParentA');
    });

    it('ScatterTransformer should format array models as coordinate matrices', () => {
      const transformer = new ScatterTransformer();
      const dummyInput = {
        points: [
          { x: 10, y: 20, label: 'ClusterX' },
        ],
      };
      const out = transformer.transform(dummyInput);

      expect(out.series[0].data).toEqual([[10, 20, 'ClusterX']]);
      expect(out.series[0].type).toBe('scatter');
    });
  });

  // ==========================================
  // TEST SUITE 3: ZOD CONSTRAINT ASSERTIONS
  // ==========================================
  describe('Zod Schema Strict Constraints', () => {
    it('should fail Bar validation given categories and values mismatch', () => {
      const faultyInput = { categories: ['Jan', 'Feb'], values: [100] };
      const parsed = BarChartDataSchema.safeParse(faultyInput);
      expect(parsed.success).toBe(false);
    });

    it('should fail line validation given invalid ISO8601 string structures', () => {
      const faultyInput = {
        points: [
          { timestamp: 'not-iso-format', value: 100 },
        ],
      };
      const parsed = LineChartDataSchema.safeParse(faultyInput);
      expect(parsed.success).toBe(false);
    });

    it('should fail Treemap validation with empty children partitions', () => {
      const faultyInput = {
        name: 'Void Treemap',
        children: [],
      };
      const parsed = TreemapDataSchema.safeParse(faultyInput as any);
      expect(parsed.success).toBe(false);
    });
  });
});
