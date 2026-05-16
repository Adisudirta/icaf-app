export const SETTING_KEYS = ["weekly_analysis_limit"] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export const DEFAULT_SETTINGS: Record<SettingKey, string> = {
  weekly_analysis_limit: "5",
};

export const SETTING_LABELS: Record<SettingKey, string> = {
  weekly_analysis_limit: "Batas Analisis per Minggu",
};

export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sunday
  const daysToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + daysToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}
