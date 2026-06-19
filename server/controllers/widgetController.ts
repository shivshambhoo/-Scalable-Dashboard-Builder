import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';

export class WidgetController {
  /**
   * GET /api/widgets
   * Returns list of all eligible charts, default configs and properties
   */
  public getWidgets(req: Request, res: Response): void {
    try {
      const widgetsList = mockDataService.getSupportedWidgets();
      res.status(200).json(widgetsList);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve available widgets catalog.',
        detail: err.message,
      });
    }
  }

  /**
   * GET /api/data/:widgetType
   * Returns the mock dataset. Supports:
   *  - query param ?error=true (triggers HTTP 500 server crash)
   *  - query param ?malformed=true (triggers invalid Zod schema structure)
   */
  public getWidgetData(req: Request, res: Response): void {
    const { widgetType } = req.params;
    const simulateError = req.query.error === 'true';
    const simulateMalformed = req.query.malformed === 'true';

    // 1. Simulate server-side down-times/errors
    if (simulateError) {
      res.status(500).json({
        success: false,
        error: `Simulated server crash on retrieval for widget type: ${widgetType}`,
      });
      return;
    }

    try {
      const dataSet = mockDataService.getWidgetDataset(widgetType, simulateMalformed);
      res.status(200).json(dataSet);
    } catch (err: any) {
      // Catch validation or other schema issues
      res.status(422).json({
        success: false,
        error: `Data generation or server schema validation failed for ${widgetType}.`,
        message: err.message,
      });
    }
  }
}

export const widgetController = new WidgetController();
export default widgetController;
