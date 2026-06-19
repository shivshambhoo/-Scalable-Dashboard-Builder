/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { widgetRegistry } from './widgetRegistry';
import {
  BarChartDataSchema,
  LineChartDataSchema,
  TreemapDataSchema,
  ScatterPlotDataSchema,
} from '../../server/schemas/chartSchemas';
import {
  BarTransformer,
  LineTransformer,
  TreemapTransformer,
  ScatterTransformer,
} from '../utils/transformers';
import {
  generateBarMockData,
  generateLineMockData,
  generateTreemapMockData,
  generateScatterMockData,
} from '../../server/mock-data/mockGenerators';
import { BarWidget } from '../widgets/BarWidget';
import { LineWidget } from '../widgets/LineWidget';
import { TreemapWidget } from '../widgets/TreemapWidget';
import { ScatterWidget } from '../widgets/ScatterWidget';

/**
 * Boots and registers default application wide widgets into the singleton Registry
 */
export function bootstrapWidgetRegistry(): void {
  // Clear any existing registrations to ensure idempotency (e.g. during dev hot reloading)
  widgetRegistry.clearRegistry();

  // 1. Bar Chart Widget Registration
  widgetRegistry.registerWidget({
    type: 'bar',
    displayName: 'Analytical Bar Chart',
    description: 'Displays comparative category values using clean vertical rectangles.',
    schema: BarChartDataSchema,
    transformer: new BarTransformer(),
    mockGenerator: generateBarMockData,
    component: BarWidget,
  });

  // 2. Line Chart Widget Registration
  widgetRegistry.registerWidget({
    type: 'line',
    displayName: 'Time Series Line Chart',
    description: 'Tracks temporal sequences and performance over variable intervals.',
    schema: LineChartDataSchema,
    transformer: new LineTransformer(),
    mockGenerator: generateLineMockData,
    component: LineWidget,
  });

  // 3. Treemap Widget Registration
  widgetRegistry.registerWidget({
    type: 'treemap',
    displayName: 'Hierarchical Treemap',
    description: 'Visualizes structural hierarchies using packed rectangle partitions.',
    schema: TreemapDataSchema,
    transformer: new TreemapTransformer(),
    mockGenerator: generateTreemapMockData,
    component: TreemapWidget,
  });

  // 4. Scatter Plot Widget Registration
  widgetRegistry.registerWidget({
    type: 'scatter',
    displayName: 'Multi-variable Scatter Plot',
    description: 'Renders paired variables as distinct coordinates for density/cluster analysis.',
    schema: ScatterPlotDataSchema,
    transformer: new ScatterTransformer(),
    mockGenerator: generateScatterMockData,
    component: ScatterWidget,
  });

  console.log('Successfully bootstrapped widget registry with 4 premium chart types.');
}
