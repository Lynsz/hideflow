export type ProductivityGoalValues = {
  applicationsTarget: number;
  followUpsTarget: number;
  outreachTarget: number;
};

export type ProductivityMetricKey = "applications" | "follow_ups" | "outreach";

export type ProductivityMetric = {
  key: ProductivityMetricKey;
  label: string;
  description: string;
  href: string;
  current: number;
  previous: number;
  target: number;
};

export type ProductivityWindow = {
  start: string;
  endExclusive: string;
  startDate: string;
  endDateExclusive: string;
};

export type ProductivityGoalsResult = {
  currentWindow: ProductivityWindow;
  previousWindow: ProductivityWindow;
  metrics: ProductivityMetric[];
};

export type GoalProgress = {
  percentage: number;
  remaining: number;
  state: "paused" | "in_progress" | "reached";
};

export type GoalActionResult = {
  success: boolean;
  message: string;
};
