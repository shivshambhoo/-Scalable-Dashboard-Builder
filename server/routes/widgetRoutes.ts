import { Router } from 'express';
import { widgetController } from '../controllers/widgetController';

const router = Router();

// Retrieve supported widgets list
router.get('/widgets', (req, res) => widgetController.getWidgets(req, res));

// Retrieve data arrays belonging to a particular type, with support for simulated faults
router.get('/data/:widgetType', (req, res) => widgetController.getWidgetData(req, res));

export default router;
