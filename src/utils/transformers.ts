/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WidgetTransformer } from '../types/widget';
import {
  BarChartRawData,
  LineChartRawData,
  TreemapRawData,
  ScatterPlotRawData,
} from '../../server/schemas/chartSchemas';

// ==========================================
// 1. BAR CHART TRANSFORMER
// ==========================================
export class BarTransformer implements WidgetTransformer<BarChartRawData, any> {
  transform(rawData: BarChartRawData, config: Record<string, any> = {}) {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: rawData.categories,
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: config.seriesName || 'Metrics',
          type: 'bar',
          barWidth: '60%',
          data: rawData.values,
          itemStyle: {
            color: config.color || '#3b82f6',
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  }
}

// ==========================================
// 2. LINE CHART TRANSFORMER
// ==========================================
export class LineTransformer implements WidgetTransformer<LineChartRawData, any> {
  transform(rawData: LineChartRawData, config: Record<string, any> = {}) {
    // 1. Sort points chronologically
    const sortedPoints = [...rawData.points].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // 2. Map coordinates and label values
    const categories = sortedPoints.map((p) => {
      const date = new Date(p.timestamp);
      // Return a beautiful date time format (e.g., "Jan 1, 00:00")
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    });
    const values = sortedPoints.map((p) => p.value);

    return {
      tooltip: {
        trigger: 'axis',
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: categories,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: config.seriesName || 'Activity',
          type: 'line',
          smooth: config.smooth ?? true,
          data: values,
          itemStyle: {
            color: config.color || '#10b981',
          },
          areaStyle: config.fillArea
            ? {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: config.color || '#10b981' },
                    { offset: 1, color: 'rgba(16, 185, 129, 0.1)' },
                  ],
                },
              }
            : undefined,
        },
      ],
    };
  }
}

// ==========================================
// 3. TREEMAP TRANSFORMER
// ==========================================
export class TreemapTransformer implements WidgetTransformer<TreemapRawData, any> {
  transform(rawData: TreemapRawData, config: Record<string, any> = {}) {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
      },
      series: [
        {
          name: rawData.name,
          type: 'treemap',
          visibleMinArea: 300,
          label: {
            show: true,
            formatter: '{b}',
          },
          upperLabel: {
            show: true,
            height: 20,
          },
          itemStyle: {
            borderColor: '#fff',
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 0,
                gapWidth: 5,
              },
            },
            {
              itemStyle: {
                gapWidth: 1,
              },
            },
          ],
          data: rawData.children,
        },
      ],
    };
  }
}

// ==========================================
// 4. SCATTER PLOT TRANSFORMER
// ==========================================
export class ScatterTransformer implements WidgetTransformer<ScatterPlotRawData, any> {
  transform(rawData: ScatterPlotRawData, config: Record<string, any> = {}) {
    // ECharts scatter consumes array of arrays: [ [x, y, label], ... ]
    const formattedData = rawData.points.map((p) => [p.x, p.y, p.label]);

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const item = params.value;
          return `<strong>${item[2]}</strong><br/>X: ${item[0]}, Y: ${item[1]}`;
        },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        splitLine: { show: true },
      },
      yAxis: {
        type: 'value',
        splitLine: { show: true },
      },
      series: [
        {
          name: config.seriesName || 'Clients',
          type: 'scatter',
          symbolSize: config.symbolSize || 10,
          data: formattedData,
          itemStyle: {
            color: config.color || '#ec4899',
          },
        },
      ],
    };
  }
}
