/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bootstrapWidgetRegistry } from './registry/bootstrap';
import { DashboardShell } from './components/DashboardShell';

// Instantiate the QueryClient for React Query context
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent redundant background fetches during active updates
    },
  },
});

export default function App() {
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    // Bootstrap the Registry with our dynamic chart recipes
    bootstrapWidgetRegistry();
    setBootstrapped(true);
  }, []);

  if (!bootstrapped) {
    return (
      <div id="loader-wrapper" className="min-h-screen bg-slate-50 flex items-center justify-center font-sans space-y-3">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-450 font-mono">Initializing Registry Engine...</span>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardShell />
    </QueryClientProvider>
  );
}
