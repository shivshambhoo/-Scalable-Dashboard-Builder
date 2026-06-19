/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { ComponentType } from 'react';

// ==========================================
// GRID LAYOUT TYPE
// ==========================================
export interface WidgetLayout {
  w: number; // Column span (1-4 cols)
  h: number; // Grid height in pixels or units
  x: number; // X coordinate or position order
  y: number; // Y coordinate or position order
}

// ==========================================
// WIDGET STRUCTURE (ZUSTAND STATE)
// ==========================================
export interface WidgetState {
  id: string;
  title: string;
  type: string;
  layout: WidgetLayout;
  dataSource: string;
  loading: boolean;
  error: string | null;
  config: Record<string, any>;
  data?: any; // Formatted/Transformed data for UI consumption or raw data
}

// ==========================================
// REGISTRY INTERFACES
// ==========================================
export interface WidgetTransformer<TIn = any, TOut = any> {
  transform: (rawData: TIn, config?: Record<string, any>) => TOut;
}

export interface WidgetRegistryEntry<TIn = any, TOut = any> {
  type: string;
  displayName: string;
  description: string;
  schema: z.ZodSchema<TIn>;
  transformer: WidgetTransformer<TIn, TOut>;
  mockGenerator: (config?: Record<string, any>) => TIn;
  component: ComponentType<{
    widgetId: string;
    data: TOut;
    config: Record<string, any>;
    title: string;
  }>;
}

// ==========================================
// STORE INTERFACE (ZUSTAND)
// ==========================================
export interface DashboardStore {
  widgets: WidgetState[];
  addWidget: (widget: Omit<WidgetState, 'loading' | 'error' | 'data'>) => void;
  removeWidget: (id: string) => void;
  updateLayout: (id: string, layout: Partial<WidgetLayout>) => void;
  updateWidgetConfig: (id: string, config: Partial<Record<string, any>>) => void;
  updateWidgetData: (id: string, data: any, loading: boolean, error: string | null) => void;
  persistDashboard: () => void;
  loadDashboard: () => void;
  resetDashboard: () => void;
}
