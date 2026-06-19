/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import BaseEChart from '../components/BaseEChart';

interface WidgetComponentProps {
  widgetId: string;
  data: any;
  config: Record<string, any>;
  title: string;
}

export const LineWidget: React.FC<WidgetComponentProps> = React.memo(({ data, config, title }) => {
  return (
    <div id={`line-widget-inner-${title.replace(/\s+/g, '-').toLowerCase()}`} className="w-full h-full flex flex-col justify-between">
      <div className="flex-1 min-h-0 relative">
        <BaseEChart options={data} />
      </div>
    </div>
  );
});

LineWidget.displayName = 'LineWidget';
export default LineWidget;
