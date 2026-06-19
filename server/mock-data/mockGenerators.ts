import {
  BarChartRawData,
  LineChartRawData,
  TreemapRawData,
  ScatterPlotRawData,
} from '../schemas/chartSchemas';

// ==========================================
// 1. BAR CHART MOCK GENERATOR
// ==========================================
export function generateBarMockData(config: Record<string, any> = {}): BarChartRawData {
  const categories = config.categories || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const min = config.min ?? 50;
  const max = config.max ?? 500;

  const values = categories.map(() => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });

  return { categories, values };
}

// ==========================================
// 2. LINE CHART MOCK GENERATOR (ISO8601 Verification)
// ==========================================
export function generateLineMockData(config: Record<string, any> = {}): LineChartRawData {
  const length = config.length ?? 15;
  const points: { timestamp: string; value: number }[] = [];
  
  // Start from 15 days ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - length);

  let currentValue = config.startValue ?? 100;

  for (let i = 0; i < length; i++) {
    const timestamp = new Date(startDate.getTime());
    timestamp.setDate(timestamp.getDate() + i);
    
    // Simulate a random walk (time-series progression)
    const variance = (Math.random() - 0.48) * 40; // upward bias slightly
    currentValue = Math.max(20, Math.floor(currentValue + variance));

    points.push({
      timestamp: timestamp.toISOString(), // Complies perfectly with strict ISO8601 datetime patterns
      value: currentValue,
    });
  }

  return { points };
}

// ==========================================
// 3. TREEMAP MOCK GENERATOR (Recursive Hierarchy)
// ==========================================
export function generateTreemapMockData(config: Record<string, any> = {}): TreemapRawData {
  return {
    name: 'Dashboard Corp Expenses',
    children: [
      {
        name: 'Research & Development',
        children: [
          { name: 'Engineering Core', value: 450 },
          { name: 'AI Research Lab', value: 280 },
          { name: 'Infrastructure & Ops', value: 160 },
        ],
      },
      {
        name: 'Marketing & Sales',
        children: [
          { name: 'Digital Advertising', value: 310 },
          { name: 'Direct Sales Reps', value: 240 },
          { name: 'Field Campaigns', value: 90 },
        ],
      },
      {
        name: 'General & Administrative',
        children: [
          { name: 'Talent Acquisition', value: 120 },
          { name: 'Legal Affairs', value: 85 },
          { name: 'Facilities & Rent', value: 95 },
        ],
      },
    ],
  };
}

// ==========================================
// 4. SCATTER PLOT MOCK GENERATOR
// ==========================================
export function generateScatterMockData(config: Record<string, any> = {}): ScatterPlotRawData {
  const length = config.length ?? 40;
  const points: { x: number; y: number; label: string }[] = [];

  const adjectives = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Sigma', 'Omega', 'Epsilon', 'Zeta'];
  const nouns = ['Node', 'Cluster', 'Reactor', 'Server', 'Agent', 'Query', 'Stream', 'Device'];

  for (let i = 0; i < length; i++) {
    const x = Math.floor(Math.random() * 100) + 10;
    const y = Math.floor(Math.random() * 1000) + 100;
    const label = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}-${i + 1}`;

    points.push({ x, y, label });
  }

  return { points };
}
