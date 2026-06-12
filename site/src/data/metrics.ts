export interface Metric {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export const metrics: Metric[] = [
  { value: 7, suffix: '+', label: 'years in DevOps' },
  { value: 30, prefix: '−', suffix: '%', label: 'faster deploys' },
  { value: 25, prefix: '−', suffix: '%', label: 'lower cloud cost' },
  { value: 5, label: 'MCP servers unified' },
];
