#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
OBSIDIAN_VAULT="$HOME/Documents/obsidian/TheOwnerStack"

echo ""
echo "=================================="
echo "  claude-ninja — restore script"
echo "=================================="
echo ""

# ──────────────────────────────────────
# 1. Agents
# ──────────────────────────────────────
echo "[1/4] Installing agents..."
mkdir -p "$CLAUDE_DIR/agents"
cp "$SCRIPT_DIR/agents/"*.md "$CLAUDE_DIR/agents/"
echo "      Copied $(ls "$SCRIPT_DIR/agents/" | wc -l | tr -d ' ') agent files to $CLAUDE_DIR/agents/"

# ──────────────────────────────────────
# 1b. Marketing agents (AgentKits Marketing)
# ──────────────────────────────────────
echo ""
echo "[1b] Installing marketing agents..."
cp -r "$SCRIPT_DIR/agents/marketing/"*.md "$CLAUDE_DIR/agents/"
echo "✓ Marketing agents installed (20 agents from AgentKits Marketing)"

# ──────────────────────────────────────
# 1c. Marketing commands
# ──────────────────────────────────────
echo ""
echo "[1c] Installing marketing commands..."
mkdir -p "$CLAUDE_DIR/commands/marketing"
cp -r "$SCRIPT_DIR/commands/marketing/" "$CLAUDE_DIR/commands/"
echo "      Copied marketing commands to $CLAUDE_DIR/commands/marketing/"

# ──────────────────────────────────────
# 1d. Global commands
# ──────────────────────────────────────
echo ""
echo "[1d] Installing global commands..."
mkdir -p "$CLAUDE_DIR/commands"
cp "$SCRIPT_DIR/commands/next.md" "$CLAUDE_DIR/commands/"
cp "$SCRIPT_DIR/commands/test.md" "$CLAUDE_DIR/commands/"
cp "$SCRIPT_DIR/commands/lint.md" "$CLAUDE_DIR/commands/"
cp "$SCRIPT_DIR/commands/plan.md" "$CLAUDE_DIR/commands/"
cp "$SCRIPT_DIR/commands/marketing.md" "$CLAUDE_DIR/commands/"
echo "      Global commands installed: next, test, lint, plan, marketing"

# ──────────────────────────────────────
# 2. Obsidian skill plugin
# ──────────────────────────────────────
echo ""
echo "[2/4] Installing obsidian skill plugin..."
mkdir -p "$CLAUDE_DIR/plugins/cache"
cp -r "$SCRIPT_DIR/plugins/obsidian-skills/" "$CLAUDE_DIR/plugins/cache/obsidian-skills/"
echo "      Copied obsidian-skills to $CLAUDE_DIR/plugins/cache/obsidian-skills/"
echo "      NOTE: After install, run /plugins in Claude Code and enable 'obsidian-skills'."

# ──────────────────────────────────────
# 3. Obsidian vault notes
# ──────────────────────────────────────
echo ""
echo "[3/4] Installing Obsidian vault notes..."
if [ -d "$OBSIDIAN_VAULT" ]; then
  cp "$SCRIPT_DIR/obsidian/TheOwnerStack/Project Guidelines.md" "$OBSIDIAN_VAULT/Project Guidelines.md"
  cp -r "$SCRIPT_DIR/obsidian/TheOwnerStack/LeadFound" "$OBSIDIAN_VAULT/"
  if [ -d "$SCRIPT_DIR/obsidian/TheOwnerStack/PaydayBooks" ]; then
    cp -r "$SCRIPT_DIR/obsidian/TheOwnerStack/PaydayBooks" "$OBSIDIAN_VAULT/"
  fi
  echo "      Vault notes installed to $OBSIDIAN_VAULT"
else
  echo "      SKIPPED — $OBSIDIAN_VAULT does not exist."
  echo "      To install manually:"
  echo "        1. Open Obsidian and create/open the TheOwnerStack vault at $OBSIDIAN_VAULT"
  echo "        2. Re-run this script, or manually copy:"
  echo "             $SCRIPT_DIR/obsidian/TheOwnerStack/ → $OBSIDIAN_VAULT/"
fi

# ──────────────────────────────────────
# 4. Memory files
# ──────────────────────────────────────
echo ""
echo "[4/4] Memory files — manual step required"
echo ""
echo "      Memory files are project-workspace-specific. Claude Code stores them at:"
echo "        ~/.claude/projects/<encoded-path>/memory/"
echo ""
echo "      The encoded path is derived from the absolute workspace path, with '/' replaced by '-'."
echo ""
echo "      TheOwnerStack workspace memory:"
echo "        Source: $SCRIPT_DIR/memory/theownerstack/"
echo "        Install to (adjust <your-username> if needed):"
echo "          ~/.claude/projects/-Users-<your-username>-claude-projects-theownerstack/memory/"
echo ""
echo "      PaydayBooks workspace memory:"
echo "        Source: $SCRIPT_DIR/memory/paydaybooks/"
echo "        Install to:"
echo "          ~/.claude/projects/-Users-<your-username>-claude-projects-theownerstack-shopify-project/memory/"
echo ""
echo "      Example (replace 'r1' with your username):"
echo "        mkdir -p ~/.claude/projects/-Users-r1-claude-projects-theownerstack/memory/"
echo "        cp $SCRIPT_DIR/memory/theownerstack/* ~/.claude/projects/-Users-r1-claude-projects-theownerstack/memory/"
echo ""
echo "        mkdir -p ~/.claude/projects/-Users-r1-claude-projects-theownerstack-shopify-project/memory/"
echo "        cp $SCRIPT_DIR/memory/paydaybooks/* ~/.claude/projects/-Users-r1-claude-projects-theownerstack-shopify-project/memory/"

# ──────────────────────────────────────
# 5. AgentKits Memory (MCP server)
# ──────────────────────────────────────
echo ""
echo "[5] Installing AgentKits Memory MCP server..."

# Run npx from HOME so MCP config lands in ~/.claude/settings.json (not cwd)
cd "$HOME" && npx @aitytech/agentkits-memory --platform=claude-code || echo "    NOTE: Run manually: npx @aitytech/agentkits-memory"
cd "$SCRIPT_DIR"
echo "      Memory DB: ~/.claude/memory/memory.db"
echo "      Browse: npx @aitytech/agentkits-memory web  →  http://localhost:1905"

# ──────────────────────────────────────
# 6. OBSIDIAN_VAULT env var
# ──────────────────────────────────────
echo ""
echo "[6] Setting OBSIDIAN_VAULT in shell profile..."
SHELL_RC="$HOME/.zshrc"
[ -f "$HOME/.bashrc" ] && SHELL_RC="$HOME/.bashrc"
VAULT_LINE="export OBSIDIAN_VAULT=\"$HOME/Documents/obsidian/TheOwnerStack\""
if ! grep -q "OBSIDIAN_VAULT" "$SHELL_RC" 2>/dev/null; then
  echo "" >> "$SHELL_RC"
  echo "# claude-ninja" >> "$SHELL_RC"
  echo "$VAULT_LINE" >> "$SHELL_RC"
  echo "      Added to $SHELL_RC — run: source $SHELL_RC"
else
  echo "      Already set in $SHELL_RC — skipping"
fi

# ──────────────────────────────────────
# 7. Memory files (auto-detect username)
# ──────────────────────────────────────
echo ""
echo "[7] Installing memory files..."
USERNAME=$(whoami)
TOS_MEM="$HOME/.claude/projects/-Users-${USERNAME}-claude-projects-theownerstack/memory"
PB_MEM="$HOME/.claude/projects/-Users-${USERNAME}-claude-projects-theownerstack-shopify-project/memory"

mkdir -p "$TOS_MEM"
cp "$SCRIPT_DIR/memory/theownerstack/"* "$TOS_MEM/"
echo "      Installed theownerstack memory → $TOS_MEM"

mkdir -p "$PB_MEM"
cp "$SCRIPT_DIR/memory/paydaybooks/"* "$PB_MEM/"
echo "      Installed paydaybooks memory   → $PB_MEM"

echo ""
echo "      NOTE: These paths assume your projects live at ~/claude-projects/theownerstack/"
echo "      If they're elsewhere, copy manually from $SCRIPT_DIR/memory/"

# ──────────────────────────────────────
# 7b. Auto-route PostToolUse hook
# ──────────────────────────────────────
echo ""
echo "[7b] Installing auto-route hook..."
mkdir -p "$CLAUDE_DIR/hooks"
cp "$SCRIPT_DIR/src/hooks/auto-route.js" "$CLAUDE_DIR/hooks/auto-route.js"
echo "      Copied auto-route.js to $CLAUDE_DIR/hooks/"

# Merge hook entry into ~/.claude/settings.json (non-destructive)
node - <<'JSEOF'
const fs = require('fs');
const os = require('os');
const path = require('path');
const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (_) {}
if (!settings.hooks) settings.hooks = {};
if (!Array.isArray(settings.hooks.PostToolUse)) settings.hooks.PostToolUse = [];
const already = settings.hooks.PostToolUse.some(
  e => Array.isArray(e.hooks) && e.hooks.some(h => h.command && h.command.includes('auto-route'))
);
if (!already) {
  settings.hooks.PostToolUse.push({
    matcher: 'Edit|Write|MultiEdit',
    hooks: [{ type: 'command', command: 'node ~/.claude/hooks/auto-route.js', timeout: 5 }]
  });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
  console.log('      Added auto-route hook to ~/.claude/settings.json');
} else {
  console.log('      Auto-route hook already in settings.json — skipped');
}
JSEOF

# ──────────────────────────────────────
# 8. GitHub CLI auth
# ──────────────────────────────────────
echo ""
echo "[8] Checking GitHub CLI auth..."
if gh auth status &>/dev/null; then
  GH_USER=$(gh api user --jq '.login' 2>/dev/null || echo "authenticated")
  echo "      ✓ Already logged in as: $GH_USER"
else
  echo "      ✗ Not logged in. Starting gh auth login..."
  echo ""
  gh auth login
fi

# ──────────────────────────────────────
# 9. Obsidian
# ──────────────────────────────────────
echo ""
echo "[9] Checking if Obsidian is running..."
if pgrep -x "Obsidian" &>/dev/null; then
  echo "      ✓ Obsidian is open"
else
  echo "      ✗ Obsidian is not running."
  echo ""
  echo "      The obsidian CLI needs Obsidian open to work."
  read -r -p "      Open Obsidian now? [Y/n] " open_obsidian
  if [[ "$open_obsidian" =~ ^[Nn]$ ]]; then
    echo "      Skipped — remember to open Obsidian before running /next"
  else
    open -a Obsidian 2>/dev/null || echo "      Could not open Obsidian — open it manually"
    echo "      Waiting for Obsidian to start..."
    sleep 3
    pgrep -x "Obsidian" &>/dev/null && echo "      ✓ Obsidian is running" || echo "      Still not detected — may need a moment"
  fi
fi

# ──────────────────────────────────────
# Final checklist
# ──────────────────────────────────────
echo ""
echo "=================================="
echo "  Install complete"
echo "=================================="
echo ""
echo "  [x] Agents (65)        → ~/.claude/agents/"
echo "  [x] Commands           → ~/.claude/commands/ (next, test, lint, plan, marketing)"
echo "  [x] Obsidian skill     → ~/.claude/plugins/cache/obsidian-skills/"
echo "  [x] Memory MCP         → ~/.claude/settings.json"
echo "  [x] Memory files       → ~/.claude/projects/.../memory/"
echo "  [x] OBSIDIAN_VAULT     → shell profile"
echo "  [x] Auto-route hook    → ~/.claude/hooks/auto-route.js + settings.json"
echo "  [x] GitHub CLI         → checked/configured"
echo "  [x] Obsidian           → checked/launched"
echo ""
echo "  Per-project setup (one time per repo):"
echo "    echo 'ProjectName' > .claude/obsidian-project"
echo "    git add .claude/ && git commit -m 'Add claude-ninja integration'"
echo ""
echo "Done. Welcome back, dan1d."
echo ""
