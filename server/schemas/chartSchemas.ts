import { z } from 'zod';

// ==========================================
// 1. BAR CHART SCHEMA
// ==========================================
export const BarChartDataSchema = z.object({
  categories: z.array(z.string()).nonempty('Bar chart categories must not be empty.'),
  values: z.array(z.number()),
}).refine(
  (data) => data.categories.length === data.values.length,
  {
    message: 'Categories and values arrays must have equal length.',
    path: ['values'],
  }
);

export type BarChartRawData = z.infer<typeof BarChartDataSchema>;

// ==========================================
// 2. LINE CHART SCHEMA (ISO8601 Verification)
// ==========================================
export const LineChartPointSchema = z.object({
  timestamp: z.string().refine(
    (val) => {
      // Robust ISO8601 pattern check (e.g., 2026-01-01T00:00:00Z)
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}(:?\d{2})?)$/;
      return iso8601Regex.test(val) && !isNaN(Date.parse(val));
    },
    { message: 'Must be a valid ISO8601 date string.' }
  ),
  value: z.number(),
});

export const LineChartDataSchema = z.object({
  points: z.array(LineChartPointSchema).nonempty('Line chart points must contain at least one point.'),
});

export type LineChartRawData = z.infer<typeof LineChartDataSchema>;

// ==========================================
// 3. TREEMAP SCHEMA (Recursive Structure)
// ==========================================
export interface TreeNode {
  name: string;
  value?: number;
  children?: TreeNode[];
}

export const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    value: z.number().optional(),
    children: z.array(TreeNodeSchema).optional(),
  })
);

export const TreemapDataSchema = z.object({
  name: z.string(),
  children: z.array(TreeNodeSchema).nonempty('Treemap must have at least one child node.'),
});

export type TreemapRawData = z.infer<typeof TreemapDataSchema>;

// ==========================================
// 4. SCATTER PLOT SCHEMA
// ==========================================
export const ScatterPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  label: z.string(),
});

export const ScatterPlotDataSchema = z.object({
  points: z.array(ScatterPointSchema).nonempty('Scatter plot must contain at least one point.'),
});

export type ScatterPlotRawData = z.infer<typeof ScatterPlotDataSchema>;
