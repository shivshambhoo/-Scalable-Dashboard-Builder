/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { DashboardStore, WidgetState, WidgetLayout } from '../types/widget';

const LOCAL_STORAGE_KEY = 'scalable-dashboard-builder-config';

// Define high-quality default widgets to pre-populate the dashboard if localStorage is empty
const DEFAULT_WIDGETS: WidgetState[] = [
  {
    id: 'widget-sales-bar',
    title: 'Monthly Revenue Goals',
    type: 'bar',
    layout: { w: 2, h: 2, x: 0, y: 0 },
    dataSource: '/api/data/bar',
    loading: false,
    error: null,
    config: { color: '#3b82f6', showLegend: true },
  },
  {
    id: 'widget-traffic-line',
    title: 'System Request Latency',
    type: 'line',
    layout: { w: 2, h: 2, x: 2, y: 0 },
    dataSource: '/api/data/line',
    loading: false,
    error: null,
    config: { color: '#10b981', smooth: true },
  },
  {
    id: 'widget-org-treemap',
    title: 'Corporate Expense Hierarchy',
    type: 'treemap',
    layout: { w: 2, h: 2, x: 0, y: 2 },
    dataSource: '/api/data/treemap',
    loading: false,
    error: null,
    config: { leafDepth: 1 },
  },
  {
    id: 'widget-engagement-scatter',
    title: 'User Age vs Experience Duration',
    type: 'scatter',
    layout: { w: 2, h: 2, x: 2, y: 2 },
    dataSource: '/api/data/scatter',
    loading: false,
    error: null,
    config: { symbolSize: 12 },
  },
];

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  widgets: [],

  addWidget: (newWidget) => {
    set((state) => {
      // Avoid duplicate IDs
      if (state.widgets.some((w) => w.id === newWidget.id)) {
        return state;
      }
      const widget: WidgetState = {
        ...newWidget,
        loading: false,
        error: null,
        data: undefined,
      };
      const updated = [...state.widgets, widget];
      return { widgets: updated };
    });
    // Auto persist changes
    get().persistDashboard();
  },

  removeWidget: (id) => {
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
    }));
    get().persistDashboard();
  },

  updateLayout: (id, coords) => {
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, layout: { ...w.layout, ...coords } } : w
      ),
    }));
    get().persistDashboard();
  },

  updateWidgetConfig: (id, newConfig) => {
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, config: { ...w.config, ...newConfig } } : w
      ),
    }));
    get().persistDashboard();
  },

  updateWidgetData: (id, data, loading, error) => {
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, data, loading, error } : w
      ),
    }));
  },

  persistDashboard: () => {
    try {
      const { widgets } = get();
      // Only persist layout metadata and configurations, not transient fetching/loading and data states
      const serializableWidgets = widgets.map(({ id, title, type, layout, dataSource, config }) => ({
        id,
        title,
        type,
        layout,
        dataSource,
        config,
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializableWidgets));
    } catch (err) {
      console.error('Failed to save dashboard to localStorage:', err);
    }
  },

  loadDashboard: () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Omit<WidgetState, 'loading' | 'error'>[];
        const widgetsState: WidgetState[] = parsed.map((item) => ({
          ...item,
          loading: false,
          error: null,
          data: undefined,
        }));
        set({ widgets: widgetsState });
      } else {
        // Fall back to highly polished default widgets set
        set({ widgets: DEFAULT_WIDGETS });
      }
    } catch (err) {
      console.error('Failed to load dashboard config from localStorage:', err);
      set({ widgets: DEFAULT_WIDGETS });
    }
  },

  resetDashboard: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({ widgets: DEFAULT_WIDGETS });
  },
}));
