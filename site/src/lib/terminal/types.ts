export interface OutputLine {
  text: string;
  tone?: 'default' | 'muted' | 'green' | 'amber' | 'error';
}

export interface CommandAction {
  type: 'navigate' | 'download' | 'clear';
  target?: string;
}

export interface CommandResult {
  output: OutputLine[];
  action?: CommandAction;
}

export interface Command {
  name: string;
  description: string; // plain-English, used by the `? Commands` cheat-sheet
  run: (args: string[]) => CommandResult;
}
