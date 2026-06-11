export interface SkillGroup {
  category: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  { category: 'Cloud', skills: ['AWS', 'Azure', 'Google Cloud'] },
  { category: 'CI/CD & DevOps', skills: ['Azure DevOps', 'ArgoCD', 'Jenkins', 'Docker', 'Kubernetes', 'Scalr'] },
  { category: 'Infrastructure as Code', skills: ['Terraform', 'Ansible', 'ARM/Bicep', 'Scalr'] },
  { category: 'AI & Automation', skills: ['Model Context Protocol (MCP)', 'Claude plugins & agents', 'Power Automate', 'Prompt/skill engineering'] },
  { category: 'Observability & Security', skills: ['New Relic', 'Snyk', 'Anomaly detection', 'Monitoring & alerting'] },
  { category: 'Data Engineering', skills: ['Databricks', 'Change Data Capture (CDC)'] },
  { category: 'Languages', skills: ['Python', 'PowerShell', 'Bash', 'C'] },
  { category: 'Databases', skills: ['SQL Server', 'MySQL', 'PostgreSQL'] },
];
