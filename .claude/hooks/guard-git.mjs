#!/usr/bin/env node
// PreToolUse guard: main-only Git workflow. Exit 2 blocks the Bash call.
import { readFileSync } from 'node:fs';

let cmd = '';
try {
  cmd = JSON.parse(readFileSync(0, 'utf8'))?.tool_input?.command ?? '';
} catch {
  process.exit(0);
}

const block = (why) => {
  process.stderr.write(`Blocked by .claude/hooks/guard-git.mjs: ${why}. Work only on main (see AGENTS.md).\n`);
  process.exit(2);
};

// Drop heredoc bodies (file contents, not commands), then split on shell separators.
cmd = cmd.replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2(?=\s|$)/g, '');
const parts = cmd.split(/&&|\|\||;|\||\n|\$\(|`/);
for (const raw of parts) {
  const t = raw.trim().replace(/^(sudo|env\s+\S+=\S+)\s+/, '').split(/\s+/).filter(Boolean);
  const gi = t.indexOf('git');
  if (t[0] === 'gh' && (t[1] === 'pr' || t[1] === 'issue')) block('use "gh api", not gh pr / gh issue');
  if (gi === -1) continue;
  // drop global options like -C <dir>, -c k=v
  let i = gi + 1;
  while (i < t.length && t[i].startsWith('-')) i += t[i] === '-C' || t[i] === '-c' ? 2 : 1;
  const sub = t[i];
  const args = t.slice(i + 1);
  const has = (...f) => args.some((a) => f.includes(a) || f.some((x) => x.startsWith('--') && a.startsWith(x + '=')));

  if (sub === 'branch') {
    const listOnly = ['-a', '--all', '-r', '--remotes', '-l', '--list', '-v', '-vv', '--verbose', '--show-current', '--contains', '--merged', '--no-merged', '--format', '--sort', '--no-color', '--color', '-d', '--delete', '-D'];
    const creates = has('-m', '-M', '-c', '-C', '--move', '--copy', '-t', '--track', '--set-upstream-to', '-u', '-f', '--force');
    const positional = args.filter((a) => !a.startsWith('-'));
    const deleting = has('-d', '--delete', '-D');
    const listing = args.every((a) => listOnly.includes(a) || a.startsWith('--format') || a.startsWith('--sort')) || has('-l', '--list', '--contains', '--merged', '--no-merged');
    if (creates || (positional.length > 0 && !listing && !deleting)) block('branch creation/rename is not allowed');
  }
  if ((sub === 'checkout' && has('-b', '-B', '--orphan')) || (sub === 'switch' && has('-c', '-C', '--create', '--force-create', '--orphan'))) {
    block('creating branches is not allowed');
  }
  if (sub === 'worktree' && args[0] === 'add') block('git worktree add is not allowed');
  if (sub === 'push') {
    if (has('-f', '--force', '--force-with-lease', '--force-if-includes', '--mirror', '--all', '--tags', '--follow-tags', '-d', '--delete', '--prune')) {
      block('force, delete, tag, and mirror pushes are not allowed');
    }
    const pos = args.filter((a) => !a.startsWith('-'));
    const refspecs = pos.slice(1);
    for (const r of refspecs) {
      if (r.startsWith('+')) block('force refspecs are not allowed');
      const dst = r.includes(':') ? r.split(':')[1] : r;
      if (!['main', 'refs/heads/main'].includes(dst)) block(`push target "${dst}" is not main`);
    }
  }
}
process.exit(0);
