import {
  generateBarMockData,
  generateLineMockData,
  generateTreemapMockData,
  generateScatterMockData,
} from '../mock-data/mockGenerators';
import {
  BarChartDataSchema,
  LineChartDataSchema,
  TreemapDataSchema,
  ScatterPlotDataSchema,
} from '../schemas/chartSchemas';

export interface WidgetListItem {
  type: string;
  displayName: string;
  description: string;
  defaultConfig: Record<string, any>;
}

export class MockDataService {
  /**
   * Retrieves metadata of all supported system widgets
   */
  public getSupportedWidgets(): WidgetListItem[] {
    return [
      {
        type: 'bar',
        displayName: 'Analytical Bar Chart',
        description: 'Comparative data across distinct categories using vertical rectangular bars.',
        defaultConfig: { color: '#3b82f6', showLegend: true },
      },
      {
        type: 'line',
        displayName: 'Time Series Line Chart',
        description: 'Temporal progression tracking over a historical date index.',
        defaultConfig: { color: '#10b981', smooth: true, fillArea: false },
      },
      {
        type: 'treemap',
        displayName: 'Hierarchical Treemap',
        description: 'Recursive organizational, division or expenditure hierarchies mapped inside grid partitions.',
        defaultConfig: { leafDepth: 1 },
      },
      {
        type: 'scatter',
        displayName: 'Multi-variable Scatter Plot',
        description: 'Coordination plotting of variables to detect high-density clusters.',
        defaultConfig: { symbolSize: 12, color: '#ec4899' },
      },
    ];
  }

  /**
   * Generates type-safe mock dataset, executing Zod validations server-side before delivery
   */
  public getWidgetDataset(type: string, simulateMalformed: boolean = false): any {
    let rawPayload: any;

    switch (type) {
      case 'bar':
        rawPayload = generateBarMockData();
        if (!simulateMalformed) {
          BarChartDataSchema.parse(rawPayload); // Run server-side validation
        } else {
          rawPayload = { categories: ['ErrorNode'], values: [10, 20, 30] }; // Force array length inequality -> breaks Zod
        }
        break;

      case 'line':
        rawPayload = generateLineMockData();
        if (!simulateMalformed) {
          LineChartDataSchema.parse(rawPayload); // Run server-side validation
        } else {
          rawPayload = { points: [{ timestamp: 'NOT-ISO-8601-STRING', value: 999 }] }; // Violates regex datetime check
        }
        break;

      case 'treemap':
        rawPayload = generateTreemapMockData();
        if (!simulateMalformed) {
          TreemapDataSchema.parse(rawPayload); // Run server-side validation
        } else {
          rawPayload = { name: 'Faulty Treemap', children: [] }; // Voilates .nonempty() child array check
        }
        break;

      case 'scatter':
        rawPayload = generateScatterMockData();
        if (!simulateMalformed) {
          ScatterPlotDataSchema.parse(rawPayload); // Run server-side validation
        } else {
          rawPayload = { points: [{ x: 'string-instead-of-number', y: 123, label: 'Bug' }] }; // Type violation
        }
        break;

      default:
        throw new Error(`Unsupported widget type: ${type}`);
    }

    return rawPayload;
  }
}

export const mockDataService = new MockDataService();
export default mockDataService;
