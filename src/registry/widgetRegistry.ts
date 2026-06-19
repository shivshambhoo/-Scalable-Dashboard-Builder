/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WidgetRegistryEntry } from '../types/widget';

class WidgetRegistry {
  private registry = new Map<string, WidgetRegistryEntry>();

  /**
   * Register a new widget type with its schema, component, transformer, and mock code
   */
  public registerWidget<TIn = any, TOut = any>(entry: WidgetRegistryEntry<TIn, TOut>): void {
    if (this.registry.has(entry.type)) {
      console.warn(`Widget type "${entry.type}" is already registered. Overwriting entry.`);
    }
    this.registry.set(entry.type, entry);
  }

  /**
   * Retrieve a registered widget entry by its unique slug/type-identifier
   */
  public getWidget<TIn = any, TOut = any>(type: string): WidgetRegistryEntry<TIn, TOut> | undefined {
    return this.registry.get(type);
  }

  /**
   * Checks if a widget type exists in the registry
   */
  public has(type: string): boolean {
    return this.registry.has(type);
  }

  /**
   * Retrieve all registered widget definitions
   */
  public getAllWidgets(): WidgetRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * Clear all registered widgets (mostly for unit testing)
   */
  public clearRegistry(): void {
    this.registry.clear();
  }
}

// Export a singleton instance of the registry
export const widgetRegistry = new WidgetRegistry();
export default widgetRegistry;
