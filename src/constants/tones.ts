// Colour themes for cards and icons (tinted icon tile + soft background), from the chart colour tokens
// in index.css. Each topic keeps its colour across the app: students & fee collection blue, batches magenta,
// money collected green, outstanding orange, payment status aqua. Used by the dashboard and the landing page.
export const TONE_CLASSES = {
  blue: { iconTile: "bg-chart-1/15 text-chart-1", background: "from-chart-1/10" },
  magenta: { iconTile: "bg-chart-5/20 text-chart-5", background: "from-chart-5/10" },
  green: { iconTile: "bg-chart-status-paid/15 text-chart-status-paid", background: "from-chart-status-paid/10" },
  orange: { iconTile: "bg-chart-2/15 text-chart-2", background: "from-chart-2/10" },
  aqua: { iconTile: "bg-chart-3/15 text-chart-3", background: "from-chart-3/10" },
} as const
