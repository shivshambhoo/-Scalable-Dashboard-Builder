/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { widgetRegistry } from '../registry/widgetRegistry';

interface WidgetLoaderOptions {
  widgetId: string;
  type: string;
  dataSource: string;
  config: Record<string, any>;
  errorSimulated?: boolean;
  malformedSimulated?: boolean;
}

export function useWidgetLoader({
  widgetId,
  type,
  dataSource,
  config,
  errorSimulated = false,
  malformedSimulated = false,
}: WidgetLoaderOptions) {
  const updateWidgetData = useDashboardStore((state) => state.updateWidgetData);

  // Construct target API URL with mock fault query flags to force failures or schema mismatches
  const queryParams = new URLSearchParams();
  if (errorSimulated) queryParams.set('error', 'true');
  if (malformedSimulated) queryParams.set('malformed', 'true');

  const queryString = queryParams.toString();
  const fetchUrl = queryString ? `${dataSource}?${queryString}` : dataSource;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['widget-data', widgetId, fetchUrl, config],
    queryFn: async () => {
      // 1. Raw API Response retrieve
      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        let errDesc = `HTTP error ${response.status}`;
        try {
          const detail = await response.json();
          errDesc = detail.error || errDesc;
        } catch (_) {}
        throw new Error(errDesc);
      }

      const rawPayload = await response.json();

      // 2. Fetch the Registry definitions
      const registryEntry = widgetRegistry.getWidget(type);
      if (!registryEntry) {
        throw new Error(`Widget Type "${type}" does not exist in registry.`);
      }

      // 3. Schema Validation step via Zod
      // This validates the data contract completely
      const validatedData = registryEntry.schema.parse(rawPayload);

      // 4. Data Transformation step
      // Reshapes raw properties into beautiful ECharts layout structures
      const transformedData = registryEntry.transformer.transform(validatedData, config);

      return transformedData;
    },
    // Keep caching active & let user refresh manually or automatically
    staleTime: 60000, 
    retry: false, // Don't retry simulated client-side/interactive error states excessively
  });

  // Keep Zustand UI loading, error, and transformed variables fully synchronized with React Query state
  useEffect(() => {
    if (isLoading || isFetching) {
      updateWidgetData(widgetId, undefined, true, null);
    } else if (error) {
      const displayMsg = error instanceof Error ? error.message : 'Transient connection failure.';
      updateWidgetData(widgetId, undefined, false, displayMsg);
    } else if (data) {
      updateWidgetData(widgetId, data, false, null);
    }
  }, [data, isLoading, isFetching, error, widgetId, updateWidgetData]);

  return {
    transformedData: data,
    loading: isLoading || isFetching,
    errorMsg: error instanceof Error ? error.message : null,
    refetch,
  };
}
export default useWidgetLoader;
