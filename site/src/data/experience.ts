export interface Job {
  company: string;
  title: string;
  start: string;
  end: string;
  location: string;
  highlights: string[];
}

export const experience: Job[] = [
  {
    company: 'Accuris',
    title: 'DevOps Engineer',
    start: 'Dec 2025',
    end: 'Jun 2026',
    location: 'Denver, CO',
    highlights: [
      'Architected an MCP mesh unifying New Relic, ArgoCD, Snyk, Azure DevOps, and Scalr behind one coherent interface.',
      'Built a custom New Relic MCP server with higher query accuracy, lower token use, and lower latency than the existing solution.',
      'Developed a custom Claude plugin to scaffold repos, provision ArgoCD environments, and automate engineering tasks.',
      'Created a New Relic anomaly-detection tool (Power Automate) pushing real-time alerts to Microsoft Teams.',
      'Engineered Databricks CDC ingestion pipelines feeding clean real-time data to new AI models.',
    ],
  },
  {
    company: 'TransCore',
    title: 'DevOps Engineer',
    start: 'Jul 2024',
    end: 'Oct 2025',
    location: 'Denver, CO',
    highlights: [
      'Designed automated CI/CD pipelines in Azure DevOps, reducing deployment time by 30%.',
      'Built and maintained containerized environments with Docker and Kubernetes for scalable microservices.',
      'Automated infrastructure provisioning with Ansible and Bicep for consistent environments.',
      'Reduced cloud costs by 25% through resource optimization and improved monitoring.',
    ],
  },
  {
    company: 'TransCore',
    title: 'Software Engineer / Backend Developer',
    start: 'May 2023',
    end: 'Jul 2024',
    location: 'Nashville, TN',
    highlights: [
      'Created dynamic SQL monitoring tools with automated alerting, improving response times.',
      'Developed reusable, idempotent automation scripts for continuous deployment.',
      'Managed AWS infrastructure supporting high-volume production environments.',
    ],
  },
  {
    company: 'TransCore',
    title: 'Systems Specialist',
    start: 'Aug 2022',
    end: 'May 2023',
    location: 'Houston, TX',
    highlights: [
      'Automated patching for containerized systems, improving uptime and security compliance.',
      'Built health-check and deployment-validation scripts, cutting update downtime.',
    ],
  },
  {
    company: 'TransCore',
    title: 'Systems Specialist / Missing Images Team Lead',
    start: 'Aug 2021',
    end: 'Aug 2022',
    location: 'Houston, TX',
    highlights: [
      'Led a team remediating tolling data gaps, recovering lost revenue through improved accuracy.',
      'Created stored procedures for transaction validation and data-quality assurance.',
    ],
  },
];
