import { tokenize } from './tokenize';
import type { Command, CommandResult, OutputLine } from './types';
import { site } from '../../data/site';
import { skillGroups } from '../../data/skills';
import { experience } from '../../data/experience';

// Keep in sync with content/work entries. Phase 2 can generate this list.
const WORK = [{ slug: 'mcp-mesh', title: 'The MCP Mesh' }];

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
  run: (args) => {
    if (args[0] === 'work' || args.length === 0) {
      return {
        output: [
          line('projects:', 'amber'),
          ...WORK.map((w) => line(`  work/${w.slug}   ${w.title}`)),
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
  run: (args) => {
    const target = args[0] ?? '';
    const slug = target.replace(/^work\//, '');
    const found = WORK.find((w) => w.slug === slug);
    if (!found) return { output: [line(`cat: ${target}: No such file`, 'error')] };
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
  [whoami, skills, experienceCmd, ls, cat, contact, resume, underTheHood, clear, help].map((c) => [c.name, c]),
);

export function commandList(): Command[] {
  return Object.values(commandRegistry).sort((a, b) => a.name.localeCompare(b.name));
}

export function runCommand(input: string): CommandResult {
  const tokens = tokenize(input);
  if (tokens.length === 0) return { output: [] };
  const [name, ...args] = tokens;
  const cmd = commandRegistry[name];
  if (!cmd) {
    return {
      output: [line(`command not found: ${name}. Type 'help' for options.`, 'error')],
    };
  }
  return cmd.run(args);
}
