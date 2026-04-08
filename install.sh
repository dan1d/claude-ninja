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
# Final checklist
# ──────────────────────────────────────
echo ""
echo "=================================="
echo "  Post-install checklist"
echo "=================================="
echo ""
echo "  [x] Agents installed to ~/.claude/agents/"
echo "  [x] Obsidian skill plugin installed to ~/.claude/plugins/cache/obsidian-skills/"
echo ""
echo "  Manual steps remaining:"
echo ""
echo "  [ ] Enable the obsidian-skills plugin:"
echo "        Open Claude Code → run /plugins → enable 'obsidian-skills'"
echo ""
echo "  [ ] Verify Obsidian vault is open in Obsidian at:"
echo "        $OBSIDIAN_VAULT"
echo ""
echo "  [ ] Install memory files to the correct project paths (see step 4 above)"
echo ""
echo "  [ ] Authenticate gh CLI (GitHub):"
echo "        gh auth login"
echo ""
echo "  [ ] Set the OBSIDIAN_VAULT env var if needed (some skill configs read it):"
echo "        export OBSIDIAN_VAULT=\"$OBSIDIAN_VAULT\""
echo ""
echo "Done. Welcome back."
echo ""
