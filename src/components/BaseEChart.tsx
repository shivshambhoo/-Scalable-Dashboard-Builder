/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface BaseEChartProps {
  options: Record<string, any>;
  theme?: 'light' | 'dark';
}

export function BaseEChart({ options, theme = 'light' }: BaseEChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize echarts instance
    const chart = echarts.init(containerRef.current);
    chartInstanceRef.current = chart;
    chart.setOption(options);

    // Rigorous container resize observation using ResizeObserver as instructed by Guidelines
    const observer = new ResizeObserver(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    });

    if (containerRef.current.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }

    return () => {
      observer.disconnect();
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  // Sync options change dynamically
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setOption(options, true);
    }
  }, [options]);

  return (
    <div id="echart-stage-container" className="w-full h-full min-h-[180px] flex items-center justify-center">
      <div 
        ref={containerRef} 
        id="echart-canvas"
        className="w-full h-full" 
        style={{ minHeight: '100%', minWidth: '100%' }}
      />
    </div>
  );
}
export default BaseEChart;
