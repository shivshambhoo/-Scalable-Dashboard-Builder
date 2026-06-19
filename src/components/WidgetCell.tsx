/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { widgetRegistry } from '../registry/widgetRegistry';
import { useWidgetLoader } from '../hooks/useWidgetLoader';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import { WidgetState } from '../types/widget';
import {
  RotateCw,
  X,
  Sliders,
  AlertTriangle,
  Database,
  Grid,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Eye,
} from 'lucide-react';

interface WidgetCellProps {
  widget: WidgetState;
}

export const WidgetCell: React.FC<WidgetCellProps> = React.memo(({ widget }) => {
  const removeWidget = useDashboardStore((state) => state.removeWidget);
  const updateLayout = useDashboardStore((state) => state.updateLayout);
  const updateWidgetConfig = useDashboardStore((state) => state.updateWidgetConfig);

  // States to control simulated endpoints behaviors
  const [showConfig, setShowConfig] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [simulateMalformed, setSimulateMalformed] = useState(false);

  // Fetch data using the query hooks
  const { loading, errorMsg, refetch } = useWidgetLoader({
    widgetId: widget.id,
    type: widget.type,
    dataSource: widget.dataSource,
    config: widget.config,
    errorSimulated: simulateError,
    malformedSimulated: simulateMalformed,
  });

  // Query registry entries
  const entry = widgetRegistry.getWidget(widget.type);

  // Layout adjustment callbacks
  const handleWidthChange = (delta: number) => {
    const currentW = widget.layout.w;
    const nextW = Math.min(4, Math.max(1, currentW + delta));
    updateLayout(widget.id, { w: nextW });
  };

  const handleHeightChange = (delta: number) => {
    const currentH = widget.layout.h;
    const nextH = Math.min(3, Math.max(1.5, currentH + delta));
    updateLayout(widget.id, { h: nextH });
  };

  const handleConfigColorChange = (hex: string) => {
    updateWidgetConfig(widget.id, { color: hex });
  };

  const handleConfigOption = (key: string, value: any) => {
    updateWidgetConfig(widget.id, { [key]: value });
  };

  // Helper classes for widget column width spans
  const colSpans: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
  };

  const currentColSpanClass = colSpans[widget.layout.w] || 'col-span-2';

  // Format height dynamic style as pixels matching our flexible grid scale
  const calculatedHeight = widget.layout.h * 150 + (widget.layout.h - 1) * 16; // 150px baseline height + margins

  return (
    <div
      id={`widget-cell-${widget.id}`}
      className={`${currentColSpanClass} flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 relative overflow-hidden`}
      style={{ height: `${calculatedHeight}px` }}
    >
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-50 relative z-20">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono scale-90 uppercase">
              {widget.type}
            </span>
            {entry && (
              <span className="text-[10px] text-slate-400 font-mono">
                w: {widget.layout.w} × h: {widget.layout.h}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-800 font-sans tracking-tight mt-0.5">
            {widget.title}
          </h3>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center space-x-1">
          {/* Settings trigger */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition ${showConfig ? 'bg-slate-100 text-slate-700' : ''}`}
            title="Configure widget props"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Refresh Action */}
          <button
            onClick={() => refetch()}
            disabled={loading}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition ${loading ? 'animate-spin text-indigo-500' : ''}`}
            title="Reload dataset"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Remove Action */}
          <button
            onClick={() => removeWidget(widget.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Remove widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Config Panel Overlay sliding from top */}
      {showConfig && (
        <div className="absolute top-[68px] left-0 right-0 bg-slate-50 border-b border-slate-100 px-5 py-4 z-40 transition-all duration-300 shadow-inner grid grid-cols-2 gap-4 text-xs">
          {/* Width Grid Controls */}
          <div className="space-y-1.5">
            <div className="text-slate-500 font-medium flex items-center space-x-1">
              <Grid className="w-3 h-3 text-slate-400" />
              <span>Grid Column Span</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleWidthChange(-1)}
                disabled={widget.layout.w <= 1}
                className="p-1 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-semibold text-slate-700 w-8 text-center bg-white border border-slate-100 rounded-md py-0.5">
                {widget.layout.w}/4
              </span>
              <button
                onClick={() => handleWidthChange(1)}
                disabled={widget.layout.w >= 4}
                className="p-1 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Height Grid Controls */}
          <div className="space-y-1.5">
            <div className="text-slate-500 font-medium flex items-center space-x-1">
              <Grid className="w-3 h-3 text-slate-400-rotate-90" style={{ transform: 'rotate(90deg)' }} />
              <span>Grid Row Height</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleHeightChange(-0.5)}
                disabled={widget.layout.h <= 1.5}
                className="p-1 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 disabled:opacity-40 transition"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-semibold text-slate-700 w-12 text-center bg-white border border-slate-100 rounded-md py-0.5">
                {widget.layout.h.toFixed(1)}x
              </span>
              <button
                onClick={() => handleHeightChange(0.5)}
                disabled={widget.layout.h >= 3}
                className="p-1 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 disabled:opacity-40 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Testing Overrides */}
          <div className="col-span-2 border-t border-slate-200/60 pt-3 space-y-2">
            <div className="text-slate-500 font-semibold mb-1 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              <span>Developer DX Diagnostic Fault Tools</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSimulateError(!simulateError);
                  setSimulateMalformed(false);
                }}
                className={`py-1.5 px-3 rounded-lg border font-medium flex items-center justify-center space-x-2 transition ${
                  simulateError
                    ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>API Error (500)</span>
              </button>

              <button
                onClick={() => {
                  setSimulateMalformed(!simulateMalformed);
                  setSimulateError(false);
                }}
                className={`py-1.5 px-3 rounded-lg border font-medium flex items-center justify-center space-x-2 transition ${
                  simulateMalformed
                    ? 'bg-amber-50 border-amber-200 text-amber-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-amber-500" />
                <span>Malform Schema</span>
              </button>
            </div>
          </div>

          {/* Preset Colors */}
          {['bar', 'line', 'scatter'].includes(widget.type) && (
            <div className="col-span-2 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Palette Accent:</span>
              <div className="flex space-x-1.5">
                {['#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6'].map((hex) => (
                  <button
                    key={hex}
                    onClick={() => handleConfigColorChange(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-4 h-4 rounded-full border border-white ring-1 transition ${
                      widget.config.color === hex ? 'ring-slate-700 scale-110' : 'ring-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Type specific options */}
          {widget.type === 'line' && (
            <div className="col-span-2 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Line Properties:</span>
              <div className="flex space-x-3">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={widget.config.smooth !== false}
                    onChange={(e) => handleConfigOption('smooth', e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Smooth curve</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!widget.config.fillArea}
                    onChange={(e) => handleConfigOption('fillArea', e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Fill area</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Main Widget Content Canvas with dynamic resolution lookup */}
      <div id={`widget-content-body-${widget.id}`} className="flex-1 p-5 min-h-0 relative z-10">
        {/* Error State display (Network or validator) */}
        {widget.error ? (
          <div id="widget-api-error-display" className="w-full h-full flex flex-col justify-center items-center text-center p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div className="space-y-0.5">
              <h5 className="text-xs font-semibold text-slate-800">Connection Interrupt occurred</h5>
              <p className="text-[11px] text-slate-500 font-mono max-w-[200px] line-clamp-3">
                {widget.error}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="text-[10px] font-semibold text-indigo-600 border border-indigo-200 bg-white hover:bg-slate-50 rounded px-2.5 py-1 mt-1.5 transition"
            >
              Retry Connection
            </button>
          </div>
        ) : loading && !widget.data ? (
          /* Loading skeleton */
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400 font-mono animate-pulse">Syncing data stream...</span>
          </div>
        ) : widget.data && entry ? (
          /* Isolated Error Boundary wraps dynamic widget implementation */
          <WidgetErrorBoundary title={widget.title} onReset={() => refetch()}>
            {React.createElement(entry.component, {
              widgetId: widget.id,
              data: widget.data,
              config: widget.config,
              title: widget.title,
            })}
          </WidgetErrorBoundary>
        ) : (
          /* Unregistered fallback layout */
          <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-1.5 text-slate-400">
            <Eye className="w-8 h-8" />
            <h5 className="text-xs font-semibold text-slate-500">Unrecognized Component Definition</h5>
            <p className="text-[10px] text-slate-400 font-mono">
              Type: "{widget.type}" has not been dynamically registered.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

WidgetCell.displayName = 'WidgetCell';
export default WidgetCell;
