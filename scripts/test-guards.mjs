// Harmless checks for .claude/hooks/guard-git.mjs and .githooks/pre-push. Run: node scripts/test-guards.mjs
import { spawnSync } from 'node:child_process';

const hook = (command) =>
  spawnSync('node', ['.claude/hooks/guard-git.mjs'], { input: JSON.stringify({ tool_input: { command } }) }).status;
const prePush = (line) => spawnSync('bash', ['.githooks/pre-push'], { input: `${line}\n` }).status;

const Z = '0'.repeat(40);
const cases = [
  ['git branch', 0], ['git branch -a', 0], ['git branch --show-current', 0], ['git checkout main', 0],
  ['git push -u origin main', 0], ['git push -u origin main 2>&1 | tail -5', 0], ['git push origin dev 2>&1', 2], ['git pull --rebase origin main', 0], ['git worktree list', 0], ['gh api repos/x/y', 0],
  ["cat > a.md <<'EOF'\nUse `gh api`, not `gh pr`.\nEOF\necho ok", 0],
  ['git branch feature', 2], ['git checkout -b x', 2], ['git switch -c x', 2], ['git -C . branch -m new', 2],
  ['git worktree add ../x', 2], ['git push --force origin main', 2], ['git push origin +main', 2],
  ['git push origin dev', 2], ['git push --tags', 2], ['cd x && git push origin HEAD:feat', 2],
  ['gh ' + 'pr create', 2], ['gh ' + 'issue list', 2],
  ["cat > a <<EOF\nx\nEOF\ngit push origin dev", 2],
];
let fail = 0;
for (const [c, want] of cases) {
  const got = hook(c);
  if (got !== want) { fail++; console.log(`FAIL hook (${got} != ${want}): ${JSON.stringify(c)}`); }
}
const pp = [
  [`refs/heads/main 1111111111111111111111111111111111111111 refs/heads/main ${Z}`, 0],
  [`refs/heads/main ${Z} refs/heads/dev ${Z}`, 1],
  [`refs/tags/v1 1111111111111111111111111111111111111111 refs/tags/v1 ${Z}`, 1],
  [`(delete) ${Z} refs/heads/main 1111111111111111111111111111111111111111`, 1],
];
for (const [l, want] of pp) {
  const got = prePush(l);
  if (got !== want) { fail++; console.log(`FAIL pre-push (${got} != ${want}): ${l}`); }
}
console.log(fail ? `${fail} guard checks failed` : `all ${cases.length + pp.length} guard checks passed`);
process.exit(fail ? 1 : 0);
