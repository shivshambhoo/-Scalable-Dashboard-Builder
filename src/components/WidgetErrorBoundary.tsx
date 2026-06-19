/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  title: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Captured exception in isolated widget cell:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="widget-error-boundary-view" className="w-full h-full min-h-[220px] flex flex-col justify-center items-center text-center p-6 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-xs">
            <h4 className="text-sm font-semibold text-rose-900 font-sans">
              Render Boundary Interrupt
            </h4>
            <p className="text-xs text-rose-700 font-mono break-all line-clamp-3">
              {this.state.error?.message || 'Uncaught rendering exception.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            id="error-reset-button"
            className="flex items-center space-x-2 text-xs font-medium text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 py-1.5 px-3.5 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Render Loop</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
