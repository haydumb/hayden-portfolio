import { tokenize } from './tokenize';
import type { Command, CommandContext, CommandResult, OutputLine } from './types';
import { site } from '../../data/site';
import { skillGroups } from '../../data/skills';
import { experience } from '../../data/experience';

const THEME_NAMES = ['terminal', 'matrix', 'amber', 'mono'];

function line(text: string, tone: OutputLine['tone'] = 'default'): OutputLine {
  return { text, tone };
}

const whoami: Command = {
  name: 'whoami',
  description: 'who I am',
  run: () => ({
    output: [
      line(site.name, 'green'),
      line(site.role, 'amber'),
      line(site.summary, 'muted'),
    ],
  }),
};

const skills: Command = {
  name: 'skills',
  description: 'tools & tech I use',
  run: () => ({
    output: skillGroups.flatMap((g) => [
      line(`${g.category}:`, 'amber'),
      line('  ' + g.skills.join(', '), 'muted'),
    ]),
  }),
};

const experienceCmd: Command = {
  name: 'experience',
  description: 'my career timeline',
  run: () => ({
    output: experience.flatMap((j) => [
      line(`${j.title} @ ${j.company}`, 'green'),
      line(`  ${j.start} – ${j.end} · ${j.location}`, 'muted'),
    ]),
  }),
};

const ls: Command = {
  name: 'ls',
  description: 'list my projects (try: ls work)',
  run: (args, ctx) => {
    if (args[0] === 'work' || args.length === 0) {
      return {
        output: [
          line('projects:', 'amber'),
          ...ctx.work.map((w) => line(`  work/${w.slug}   ${w.title}`)),
          line('tip: cat work/<name> to open a case study', 'muted'),
        ],
      };
    }
    return { output: [line(`ls: cannot access '${args[0]}': No such directory`, 'error')] };
  },
};

const cat: Command = {
  name: 'cat',
  description: 'read a case study (e.g. cat work/mcp-mesh)',
  run: (args, ctx) => {
    const target = args[0] ?? '';
    if (!target) return { output: [line('Usage: cat work/<slug>', 'error')] };
    const slug = target.replace(/^work\//, '');
    const found = ctx.work.find((w) => w.slug === slug);
    if (!found) return { output: [line(`cat: ${target}: No such file`, 'error')] };
    return {
      output: [line(`Opening ${found.title}…`, 'green')],
      action: { type: 'navigate', target: `/work/${found.slug}` },
    };
  },
};

const open: Command = {
  name: 'open',
  description: 'open a case study (e.g. open mcp-mesh)',
  run: (args, ctx) => {
    const slug = (args[0] ?? '').replace(/^work\//, '');
    if (!slug) return { output: [line('usage: open <project> (see: ls work)', 'error')] };
    const found = ctx.work.find((w) => w.slug === slug);
    if (!found) return { output: [line(`open: ${slug}: no such project`, 'error')] };
    return {
      output: [line(`Opening ${found.title}…`, 'green')],
      action: { type: 'navigate', target: `/work/${found.slug}` },
    };
  },
};

const contact: Command = {
  name: 'contact',
  description: 'get in touch',
  run: () => ({
    output: [
      line(`email:    ${site.email}`),
      line(`github:   ${site.github}`),
      line(`linkedin: ${site.linkedin}`),
    ],
  }),
};

const resume: Command = {
  name: 'resume',
  description: 'download my CV',
  run: () => ({
    output: [line('Downloading resume.pdf…', 'green')],
    action: { type: 'download', target: '/resume.pdf' },
  }),
};

const underTheHood: Command = {
  name: 'under-the-hood',
  description: 'how this site is built',
  run: () => ({
    output: [line('Opening /under-the-hood…', 'green')],
    action: { type: 'navigate', target: '/under-the-hood' },
  }),
};

const neofetch: Command = {
  name: 'neofetch',
  description: 'system info card',
  run: () => ({
    output: [
      line(site.name, 'green'),
      line('-------------------------', 'muted'),
      line(`role:     ${site.role}`),
      line(`location: ${site.location}`),
      line('stack:    Kubernetes, Terraform, ArgoCD, MCP'),
      line('uptime:   ~7 years in DevOps'),
      line('shell:    /bin/bash'),
      line('themes:   terminal, matrix, amber, mono (try: theme matrix)', 'muted'),
    ],
  }),
};

const history: Command = {
  name: 'history',
  description: 'show command history',
  run: (_args, ctx) => {
    if (!ctx.history.length) return { output: [line('(no history yet)', 'muted')] };
    return {
      output: ctx.history.map((h, i) => line(`${String(i + 1).padStart(3)}  ${h}`)),
    };
  },
};

const theme: Command = {
  name: 'theme',
  description: 'switch color theme (matrix|amber|mono|terminal)',
  run: (args) => {
    const t = args[0];
    if (!t || !THEME_NAMES.includes(t)) {
      return { output: [line(`usage: theme <${THEME_NAMES.join('|')}>`, 'amber')] };
    }
    return { output: [line(`Theme set to ${t}.`, 'green')], action: { type: 'theme', target: t } };
  },
};

const sudo: Command = {
  name: 'sudo',
  description: 'escalate privileges',
  run: (args) => {
    if (args.join(' ').trim() === 'hire-me') {
      return {
        output: [
          line('[sudo] password for recruiter: ********', 'muted'),
          line('Access granted. Opening contact…', 'green'),
        ],
        action: { type: 'navigate', target: '/#contact' },
      };
    }
    return {
      output: [line(`sudo: ${args.join(' ') || 'command'}: permission denied (try: sudo hire-me)`, 'error')],
    };
  },
};

const clear: Command = {
  name: 'clear',
  description: 'clear the screen',
  run: () => ({ output: [], action: { type: 'clear' } }),
};

const help: Command = {
  name: 'help',
  description: 'show available commands',
  run: () => ({
    output: [
      line('Available commands — type one, or click "? Commands":', 'amber'),
      ...commandList().map((c) => line(`  ${c.name.padEnd(16)} ${c.description}`)),
      line('Press Tab to autocomplete, ↑/↓ for history.', 'muted'),
    ],
  }),
};

export const commandRegistry: Record<string, Command> = Object.fromEntries(
  [
    whoami, skills, experienceCmd, ls, cat, open, contact, resume, underTheHood,
    neofetch, history, theme, sudo, clear, help,
  ].map((c) => [c.name, c]),
);

export function commandList(): Command[] {
  return Object.values(commandRegistry).sort((a, b) => a.name.localeCompare(b.name));
}

const DEFAULT_CONTEXT: CommandContext = { history: [], work: [] };

export function runCommand(input: string, ctx: CommandContext = DEFAULT_CONTEXT): CommandResult {
  const tokens = tokenize(input);
  if (tokens.length === 0) return { output: [] };
  const [name, ...args] = tokens;
  const cmd = commandRegistry[name];
  if (!cmd) {
    return { output: [line(`command not found: ${name}. Type 'help' for options.`, 'error')] };
  }
  return cmd.run(args, ctx);
}
