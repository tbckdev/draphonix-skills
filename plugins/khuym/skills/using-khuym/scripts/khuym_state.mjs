#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const STATE_SCHEMA_VERSION = "1.0";

const DEFAULT_APPROVED_GATES = {
  context: false,
  phase_plan: false,
  execution: false,
  review: false,
};

function utcNow() {
  return new Date().toISOString();
}

export function resolveRepoRoot(explicitRoot, startFrom = process.cwd()) {
  if (explicitRoot) {
    return path.resolve(explicitRoot);
  }

  const cwd = path.resolve(startFrom);
  try {
    const stdout = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return path.resolve(stdout.trim());
  } catch {
    let candidate = cwd;
    while (true) {
      if (
        fs.existsSync(path.join(candidate, ".git")) ||
        fs.existsSync(path.join(candidate, ".khuym", "onboarding.json"))
      ) {
        return candidate;
      }
      const parent = path.dirname(candidate);
      if (parent === candidate) {
        return cwd;
      }
      candidate = parent;
    }
  }
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function fileTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === "string" && item.trim() !== "");
}

function normalizeActiveWorkers(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((worker) => ({
      codex_name: typeof worker.codex_name === "string" ? worker.codex_name : "",
      agent_mail_name:
        typeof worker.agent_mail_name === "string" ? worker.agent_mail_name : "",
      status: typeof worker.status === "string" ? worker.status : "",
      bead_id: typeof worker.bead_id === "string" ? worker.bead_id : "",
    }));
}

function normalizeApprovedGates(value) {
  const gates = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    context: Boolean(gates.context),
    phase_plan: Boolean(gates.phase_plan),
    execution: Boolean(gates.execution),
    review: Boolean(gates.review),
  };
}

export function buildDefaultState(overrides = {}) {
  const approvedGates = normalizeApprovedGates(overrides.approved_gates);
  const state = {
    schema_version: STATE_SCHEMA_VERSION,
    feature_slug: typeof overrides.feature_slug === "string" ? overrides.feature_slug : "",
    mode: typeof overrides.mode === "string" ? overrides.mode : "",
    active_skill: typeof overrides.active_skill === "string" ? overrides.active_skill : "",
    phase: typeof overrides.phase === "string" ? overrides.phase : "idle",
    phase_number: Number.isFinite(overrides.phase_number) ? overrides.phase_number : 0,
    epic_id: typeof overrides.epic_id === "string" ? overrides.epic_id : "",
    approved_gates: {
      ...DEFAULT_APPROVED_GATES,
      ...approvedGates,
    },
    active_beads: normalizeStringArray(overrides.active_beads),
    active_workers: normalizeActiveWorkers(overrides.active_workers),
    blockers: normalizeStringArray(overrides.blockers),
    last_updated:
      typeof overrides.last_updated === "string" && overrides.last_updated
        ? overrides.last_updated
        : utcNow(),
  };

  return state;
}

export function normalizeKhuymState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return buildDefaultState();
  }

  return buildDefaultState(state);
}

export function getKhuymStatePaths(repoRoot) {
  return {
    onboarding: path.join(repoRoot, ".khuym", "onboarding.json"),
    stateJson: path.join(repoRoot, ".khuym", "state.json"),
    stateMarkdown: path.join(repoRoot, ".khuym", "STATE.md"),
    handoff: path.join(repoRoot, ".khuym", "HANDOFF.json"),
    config: path.join(repoRoot, ".khuym", "config.json"),
    agents: path.join(repoRoot, "AGENTS.md"),
    criticalPatterns: path.join(repoRoot, "history", "learnings", "critical-patterns.md"),
  };
}

export function readKhuymState(repoRoot) {
  const paths = getKhuymStatePaths(repoRoot);
  return normalizeKhuymState(readJsonIfExists(paths.stateJson));
}

export function writeKhuymState(repoRoot, nextState) {
  const paths = getKhuymStatePaths(repoRoot);
  const normalized = normalizeKhuymState(nextState);
  ensureParent(paths.stateJson);
  fs.writeFileSync(paths.stateJson, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
}

function parseLooseKeyValueMarkdown(text) {
  const parsed = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9 _/-]+):\s*(.+)$/);
    if (!match) {
      continue;
    }
    const key = match[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    parsed[key] = match[2].trim();
  }
  return parsed;
}

function deriveFeatureSlug(status) {
  return (
    status.state_json.feature_slug ||
    status.handoff.feature ||
    status.state_markdown.feature ||
    status.state_markdown.focus ||
    ""
  );
}

function buildNextReads(status) {
  const reads = ["AGENTS.md"];

  if (status.handoff.exists) {
    reads.push(".khuym/HANDOFF.json");
  }

  if (status.state_json.exists) {
    reads.push(".khuym/state.json");
  }

  if (status.state_markdown.exists) {
    reads.push(".khuym/STATE.md");
  }

  const featureSlug = deriveFeatureSlug(status);
  if (featureSlug) {
    reads.push(`history/${featureSlug}/CONTEXT.md`);
  }

  if (status.critical_patterns_exists) {
    reads.push("history/learnings/critical-patterns.md");
  }

  return reads;
}

function buildRecommendedActions(status) {
  if (!status.onboarding.exists) {
    return [
      "Run Khuym onboarding before continuing.",
      "Use the plugin onboarding script in plugins/khuym/skills/using-khuym/scripts/.",
    ];
  }

  if (status.handoff.exists) {
    return [
      "Surface the saved handoff to the user before resuming.",
      "Read the saved handoff, then reopen the active feature context.",
    ];
  }

  const activeSkill = status.state_json.active_skill || status.state_markdown.skill || "";
  const phase = status.state_json.phase || status.state_markdown.phase || "";
  if (activeSkill || (phase && phase !== "idle")) {
    return [
      `Resume by reopening the active context for ${activeSkill || "the current skill"}.`,
      "Read the active feature CONTEXT.md before planning or execution work.",
    ];
  }

  return [
    "Use this status snapshot to choose the next Khuym skill.",
    "If you move into planning or execution, read critical-patterns.md first when it exists.",
  ];
}

export function readKhuymStatus(repoRoot) {
  const paths = getKhuymStatePaths(repoRoot);
  const onboarding = readJsonIfExists(paths.onboarding);
  const stateJson = readJsonIfExists(paths.stateJson);
  const handoff = readJsonIfExists(paths.handoff);
  const stateMarkdownText = fileTextIfExists(paths.stateMarkdown);
  const stateMarkdown = parseLooseKeyValueMarkdown(stateMarkdownText);

  const status = {
    repo_root: repoRoot,
    onboarding: {
      exists: Boolean(onboarding),
      status: onboarding?.status || "",
      plugin_version: onboarding?.plugin_version || "",
    },
    state_json: {
      exists: Boolean(stateJson),
      ...normalizeKhuymState(stateJson),
    },
    state_markdown: {
      exists: stateMarkdownText.trim() !== "",
      ...stateMarkdown,
    },
    handoff: {
      exists: Boolean(handoff),
      feature: typeof handoff?.feature === "string" ? handoff.feature : "",
      skill: typeof handoff?.skill === "string" ? handoff.skill : "",
      phase: typeof handoff?.phase === "string" ? handoff.phase : "",
      next_action: typeof handoff?.next_action === "string" ? handoff.next_action : "",
      context_pct:
        typeof handoff?.context_pct === "number"
          ? handoff.context_pct
          : typeof handoff?.context_pct === "string"
            ? handoff.context_pct
            : "",
    },
    critical_patterns_exists: fs.existsSync(paths.criticalPatterns),
    next_reads: [],
    recommended_actions: [],
  };

  status.next_reads = buildNextReads(status);
  status.recommended_actions = buildRecommendedActions(status);

  return status;
}

export function renderKhuymStatus(status) {
  const feature = deriveFeatureSlug(status) || "(none)";
  const skill = status.state_json.active_skill || status.state_markdown.skill || "(none)";
  const phase = status.state_json.phase || status.state_markdown.phase || "(none)";
  const mode = status.state_json.mode || "(unspecified)";
  const epicId = status.state_json.epic_id || status.state_markdown.epic || "(none)";
  const handoff = status.handoff.exists ? "present" : "absent";
  const onboarding = status.onboarding.exists
    ? `${status.onboarding.status || "installed"}${status.onboarding.plugin_version ? ` (${status.onboarding.plugin_version})` : ""}`
    : "missing";

  return [
    "Khuym Status",
    `Repo: ${status.repo_root}`,
    `Onboarding: ${onboarding}`,
    `Feature: ${feature}`,
    `Mode: ${mode}`,
    `Skill: ${skill}`,
    `Phase: ${phase}`,
    `Epic: ${epicId}`,
    `Handoff: ${handoff}`,
    "",
    "Next reads:",
    ...status.next_reads.map((item) => `- ${item}`),
    "",
    "Recommended actions:",
    ...status.recommended_actions.map((item) => `- ${item}`),
  ].join("\n");
}
