#!/usr/bin/env node

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

import { applyRepo, checkRepo, getNodeRuntimeStatus } from "./onboard_khuym.mjs";
import { buildKhuymDependencyReport } from "./khuym_dependencies.mjs";

const LOCAL_ONBOARD_SCRIPT_PATH = fileURLToPath(new URL("./onboard_khuym.mjs", import.meta.url));
const LOCAL_USING_KHUYM_SKILL_PATH = fileURLToPath(new URL("../SKILL.md", import.meta.url));
const LOCAL_REPO_ROOT = fileURLToPath(new URL("../../../../../", import.meta.url));

function runSessionStartHook(root, payload = { cwd: root }) {
  const hookPath = path.join(root, ".codex", "hooks", "khuym_session_start.mjs");
  const stdout = execFileSync("node", [hookPath], {
    cwd: root,
    encoding: "utf8",
    input: JSON.stringify(payload),
  });
  return JSON.parse(stdout);
}

test("applyRepo creates full repo onboarding with node-based hooks", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    const result = applyRepo(root, false);

    assert.equal(result.result.status, "complete");
    assert.equal(result.status, "up_to_date");
    assert.equal(result.details.runtime.supported, true);
    assert.ok(fs.existsSync(path.join(root, "AGENTS.md")));
    assert.match(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), /Khuym Workflow/);
    assert.ok(fs.existsSync(path.join(root, ".codex", "config.toml")));
    assert.ok(fs.existsSync(path.join(root, ".codex", "hooks.json")));
    assert.ok(fs.existsSync(path.join(root, ".khuym", "onboarding.json")));
    assert.ok(fs.existsSync(path.join(root, ".khuym", "state.json")));
    assert.ok(fs.existsSync(path.join(root, ".codex", "hooks", "khuym_session_start.mjs")));
    assert.ok(fs.existsSync(path.join(root, ".codex", "khuym_status.mjs")));
    assert.ok(fs.existsSync(path.join(root, ".codex", "khuym_state.mjs")));
    assert.ok(fs.existsSync(path.join(root, ".codex", "khuym_dependencies.mjs")));
    assert.match(
      fs.readFileSync(path.join(root, ".codex", "hooks.json"), "utf8"),
      /node \.codex\/hooks\/khuym_session_start\.mjs/,
    );
    assert.equal(
      JSON.parse(fs.readFileSync(path.join(root, ".khuym", "state.json"), "utf8")).phase,
      "idle",
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("applyRepo appends managed block to existing agents instructions", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    fs.writeFileSync(path.join(root, "AGENTS.md"), "# Existing instructions\n", "utf8");

    applyRepo(root, false);
    const agentsText = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");

    assert.match(agentsText, /# Existing instructions/);
    assert.match(agentsText, /<!-- KHUYM:START -->/);
    assert.equal((agentsText.match(/<!-- KHUYM:START -->/g) || []).length, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("applyRepo preserves an existing compact_prompt without explicit replace", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    const codexDir = path.join(root, ".codex");
    fs.mkdirSync(codexDir, { recursive: true });
    fs.writeFileSync(path.join(codexDir, "config.toml"), 'compact_prompt = """keep me"""\n', "utf8");

    const result = applyRepo(root, false);
    const configText = fs.readFileSync(path.join(codexDir, "config.toml"), "utf8");

    assert.match(configText, /compact_prompt = """keep me"""/);
    assert.equal(result.result.status, "partial");
    assert.match(JSON.stringify(result.result), /compact_prompt/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("checkRepo flags stale python hook commands and legacy hook files", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    const hooksDir = path.join(root, ".codex", "hooks");
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.writeFileSync(
      path.join(root, ".codex", "hooks.json"),
      JSON.stringify(
        {
          hooks: {
            SessionStart: [
              {
                matcher: "startup|resume",
                hooks: [
                  {
                    type: "command",
                    command:
                      'python3 "$(git rev-parse --show-toplevel 2>/dev/null || pwd)/.codex/hooks/khuym_session_start.py"',
                    statusMessage: "Khuym: session bootstrap",
                  },
                ],
              },
            ],
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    fs.writeFileSync(path.join(hooksDir, "khuym_session_start.py"), "# legacy\n", "utf8");

    const result = checkRepo(root);

    assert.equal(result.status, "needs_onboarding");
    assert.ok(result.actions.includes("install_khuym_hook_entries"));
    assert.ok(result.actions.includes("sync_khuym_hook_scripts"));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("installed khuym_status script reports onboarding and state", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    applyRepo(root, false);

    const stdout = execFileSync("node", [path.join(root, ".codex", "khuym_status.mjs"), "--json"], {
      cwd: root,
      encoding: "utf8",
    });
    const status = JSON.parse(stdout);

    assert.equal(status.onboarding.exists, true);
    assert.equal(status.state_json.exists, true);
    assert.equal(status.state_json.phase, "idle");
    assert.ok(status.dependency_health);
    assert.ok(typeof status.dependency_health.summary.missing_dependencies === "number");
    assert.ok(status.next_reads.includes("AGENTS.md"));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("installed khuym_status text distinguishes missing commands from missing MCP config", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    applyRepo(root, false);
    const skillsRoot = path.join(root, "plugins", "khuym", "skills");
    const alphaDir = path.join(skillsRoot, "alpha");
    fs.mkdirSync(alphaDir, { recursive: true });
    fs.writeFileSync(
      path.join(alphaDir, "SKILL.md"),
      [
        "---",
        "name: khuym:alpha",
        "metadata:",
        "  dependencies:",
        "    - id: missing-cli",
        "      kind: command",
        "      command: definitely-missing-command",
        "      missing_effect: unavailable",
        "      reason: required for test",
        "    - id: missing-server",
        "      kind: mcp_server",
        "      server_names: [definitely_missing_mcp_server_name]",
        "      config_sources: [repo_codex_config, global_codex_config]",
        "      missing_effect: degraded",
        "      reason: required for test",
        "---",
        "",
        "# alpha",
        "",
      ].join("\n"),
      "utf8",
    );

    const stdout = execFileSync("node", [path.join(root, ".codex", "khuym_status.mjs")], {
      cwd: root,
      encoding: "utf8",
    });

    assert.match(stdout, /Dependency health:/);
    assert.match(stdout, /Missing commands:/);
    assert.match(stdout, /definitely-missing-command/);
    assert.match(stdout, /Missing MCP server configuration:/);
    assert.match(stdout, /definitely_missing_mcp_server_name/);
    assert.match(stdout, /Affects: khuym:alpha/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("checkRepo reports dependency health summary without blocking onboarding status", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    applyRepo(root, false);
    const payload = checkRepo(root);

    assert.equal(payload.status, "up_to_date");
    assert.ok(payload.details.dependency_health);
    assert.ok(typeof payload.details.dependency_health.summary.skills_total === "number");
    assert.ok(typeof payload.details.dependency_health.summary.skills_uncovered === "number");
    assert.ok(Array.isArray(payload.details.dependency_health.skills));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("dependency report distinguishes dependency-free packaged skills from uncovered ones", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-coverage-"));
  const skillsRoot = path.join(root, "plugins", "khuym", "skills");

  try {
    const alphaDir = path.join(skillsRoot, "alpha");
    const betaDir = path.join(skillsRoot, "beta");
    fs.mkdirSync(alphaDir, { recursive: true });
    fs.mkdirSync(betaDir, { recursive: true });

    fs.writeFileSync(
      path.join(alphaDir, "SKILL.md"),
      [
        "---",
        "name: khuym:alpha",
        "metadata:",
        "  dependencies: []",
        "---",
        "",
        "# alpha",
        "",
      ].join("\n"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(betaDir, "SKILL.md"),
      [
        "---",
        "name: khuym:beta",
        "description: uncovered fixture",
        "---",
        "",
        "# beta",
        "",
      ].join("\n"),
      "utf8",
    );

    const report = buildKhuymDependencyReport({
      repoRoot: root,
      skillsRoot,
      globalCodexConfigPath: path.join(root, "missing-global.toml"),
      commandProbe: () => ({ available: true, detail: "unused in coverage test" }),
    });

    assert.equal(report.summary.skills_total, 2);
    assert.equal(report.summary.skills_covered, 1);
    assert.equal(report.summary.skills_dependency_free, 1);
    assert.equal(report.summary.skills_uncovered, 1);
    assert.equal(report.summary.skills_available, 1);
    assert.equal(report.summary.declared_dependencies, 0);
    assert.deepEqual(report.uncovered_skills.map((skill) => skill.skill_name), ["khuym:beta"]);

    const alpha = report.skills.find((skill) => skill.skill_name === "khuym:alpha");
    const beta = report.skills.find((skill) => skill.skill_name === "khuym:beta");
    assert.equal(alpha?.coverage_status, "dependency_free");
    assert.equal(alpha?.status, "available");
    assert.equal(beta?.coverage_status, "uncovered");
    assert.equal(beta?.status, "uncovered");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("khuym_status text surfaces uncovered packaged skills instead of skipping them", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-coverage-"));

  try {
    applyRepo(root, false);
    const skillsRoot = path.join(root, "plugins", "khuym", "skills");
    const alphaDir = path.join(skillsRoot, "alpha");
    const betaDir = path.join(skillsRoot, "beta");
    fs.mkdirSync(alphaDir, { recursive: true });
    fs.mkdirSync(betaDir, { recursive: true });

    fs.writeFileSync(
      path.join(alphaDir, "SKILL.md"),
      [
        "---",
        "name: khuym:alpha",
        "metadata:",
        "  dependencies: []",
        "---",
        "",
        "# alpha",
        "",
      ].join("\n"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(betaDir, "SKILL.md"),
      [
        "---",
        "name: khuym:beta",
        "description: uncovered fixture",
        "---",
        "",
        "# beta",
        "",
      ].join("\n"),
      "utf8",
    );

    const payload = checkRepo(root);
    assert.equal(payload.details.dependency_health.summary.skills_dependency_free, 1);
    assert.equal(payload.details.dependency_health.summary.skills_uncovered, 1);

    const stdout = execFileSync("node", [path.join(root, ".codex", "khuym_status.mjs")], {
      cwd: root,
      encoding: "utf8",
    });
    assert.match(stdout, /Packaged skill coverage: 2 total/);
    assert.match(stdout, /Uncovered packaged skills:/);
    assert.match(stdout, /khuym:beta/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("checkRepo promotes missing dependency data into an operator-facing warning summary", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    applyRepo(root, false);
    const skillsRoot = path.join(root, "plugins", "khuym", "skills");
    const alphaDir = path.join(skillsRoot, "alpha");
    fs.mkdirSync(alphaDir, { recursive: true });
    fs.writeFileSync(
      path.join(alphaDir, "SKILL.md"),
      [
        "---",
        "name: khuym:alpha",
        "metadata:",
        "  dependencies:",
        "    - id: missing-cli",
        "      kind: command",
        "      command: definitely-missing-command",
        "      missing_effect: unavailable",
        "      reason: required for test",
        "    - id: missing-server",
        "      kind: mcp_server",
        "      server_names: [definitely_missing_mcp_server_name]",
        "      config_sources: [repo_codex_config, global_codex_config]",
        "      missing_effect: degraded",
        "      reason: required for test",
        "---",
        "",
        "# alpha",
        "",
      ].join("\n"),
      "utf8",
    );

    const payload = checkRepo(root);
    const warning = payload.details.dependency_warning;

    assert.equal(warning.status, "warning");
    assert.equal(warning.missing_dependencies_count, 2);
    assert.deepEqual(warning.affected_skills, ["khuym:alpha"]);
    assert.match(warning.message, /Dependency warning:/);
    assert.match(warning.message, /khuym:alpha/);
    assert.match(warning.message, /Missing commands: definitely-missing-command/);
    assert.match(
      warning.message,
      /Missing MCP server configuration: definitely_missing_mcp_server_name/,
    );
    assert.equal(warning.missing_commands.length, 1);
    assert.equal(warning.missing_commands[0].command, "definitely-missing-command");
    assert.equal(warning.missing_mcp_servers.length, 1);
    assert.deepEqual(warning.missing_mcp_servers[0].servers, ["definitely_missing_mcp_server_name"]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("onboard check JSON includes dependency warning summary when dependencies are missing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    applyRepo(root, false);
    const skillsRoot = path.join(root, "plugins", "khuym", "skills");
    const alphaDir = path.join(skillsRoot, "alpha");
    fs.mkdirSync(alphaDir, { recursive: true });
    fs.writeFileSync(
      path.join(alphaDir, "SKILL.md"),
      [
        "---",
        "name: khuym:alpha",
        "metadata:",
        "  dependencies:",
        "    - id: missing-cli",
        "      kind: command",
        "      command: definitely-missing-command",
        "      missing_effect: unavailable",
        "      reason: required for test",
        "    - id: missing-server",
        "      kind: mcp_server",
        "      server_names: [definitely_missing_mcp_server_name]",
        "      config_sources: [repo_codex_config, global_codex_config]",
        "      missing_effect: degraded",
        "      reason: required for test",
        "---",
        "",
        "# alpha",
        "",
      ].join("\n"),
      "utf8",
    );

    const stdout = execFileSync("node", [path.join(root, ".codex", "khuym_status.mjs"), "--json"], {
      cwd: root,
      encoding: "utf8",
    });
    const status = JSON.parse(stdout);
    assert.equal(status.dependency_health.summary.missing_dependencies, 2);

    const onboardStdout = execFileSync(
      "node",
      [
        LOCAL_ONBOARD_SCRIPT_PATH,
        "--repo-root",
        root,
      ],
      { cwd: root, encoding: "utf8" },
    );
    const onboardPayload = JSON.parse(onboardStdout);
    const warning = onboardPayload.details.dependency_warning;

    assert.equal(warning.status, "warning");
    assert.match(warning.message, /Dependency warning:/);
    assert.match(warning.message, /khuym:alpha/);
    assert.match(warning.message, /Missing commands: definitely-missing-command/);
    assert.match(
      warning.message,
      /Missing MCP server configuration: definitely_missing_mcp_server_name/,
    );
    assert.equal(warning.missing_dependencies_count, 2);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("session-start hook emits dependency warning with command-vs-MCP split when dependencies are missing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    applyRepo(root, false);
    const skillsRoot = path.join(root, "plugins", "khuym", "skills");
    const alphaDir = path.join(skillsRoot, "alpha");
    fs.mkdirSync(alphaDir, { recursive: true });
    fs.writeFileSync(
      path.join(alphaDir, "SKILL.md"),
      [
        "---",
        "name: khuym:alpha",
        "metadata:",
        "  dependencies:",
        "    - id: missing-cli",
        "      kind: command",
        "      command: definitely-missing-command",
        "      missing_effect: unavailable",
        "      reason: required for test",
        "    - id: missing-server",
        "      kind: mcp_server",
        "      server_names: [definitely_missing_mcp_server_name]",
        "      config_sources: [repo_codex_config, global_codex_config]",
        "      missing_effect: degraded",
        "      reason: required for test",
        "---",
        "",
        "# alpha",
        "",
      ].join("\n"),
      "utf8",
    );

    const payload = runSessionStartHook(root);
    const context = payload.hookSpecificOutput.additionalContext;

    assert.match(context, /Dependency warning:/);
    assert.match(context, /khuym:alpha/);
    assert.match(context, /Missing commands: definitely-missing-command/);
    assert.match(
      context,
      /Missing MCP server configuration: definitely_missing_mcp_server_name/,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("session-start hook stays quiet about dependency warnings when dependencies are healthy", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    applyRepo(root, false);
    const payload = runSessionStartHook(root);
    const context = payload.hookSpecificOutput.additionalContext;

    assert.doesNotMatch(context, /Dependency warning:/);
    assert.doesNotMatch(context, /Missing commands:/);
    assert.doesNotMatch(context, /Missing MCP server configuration:/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("entry surfaces share the same missing-command vs missing-MCP wording boundary", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-onboard-"));

  try {
    applyRepo(root, false);
    const skillsRoot = path.join(root, "plugins", "khuym", "skills");
    const alphaDir = path.join(skillsRoot, "alpha");
    fs.mkdirSync(alphaDir, { recursive: true });
    fs.writeFileSync(
      path.join(alphaDir, "SKILL.md"),
      [
        "---",
        "name: khuym:alpha",
        "metadata:",
        "  dependencies:",
        "    - id: missing-cli",
        "      kind: command",
        "      command: definitely-missing-command",
        "      missing_effect: unavailable",
        "      reason: required for test",
        "    - id: missing-server",
        "      kind: mcp_server",
        "      server_names: [definitely_missing_mcp_server_name]",
        "      config_sources: [repo_codex_config, global_codex_config]",
        "      missing_effect: degraded",
        "      reason: required for test",
        "---",
        "",
        "# alpha",
        "",
      ].join("\n"),
      "utf8",
    );

    const scoutText = execFileSync("node", [path.join(root, ".codex", "khuym_status.mjs")], {
      cwd: root,
      encoding: "utf8",
    });
    assert.match(scoutText, /Missing commands:/);
    assert.match(scoutText, /Missing MCP server configuration:/);
    assert.match(scoutText, /definitely-missing-command/);
    assert.match(scoutText, /definitely_missing_mcp_server_name/);
    assert.match(scoutText, /Affects: khuym:alpha/);

    const onboardPayload = JSON.parse(
      execFileSync(
        "node",
        [LOCAL_ONBOARD_SCRIPT_PATH, "--repo-root", root],
        { cwd: root, encoding: "utf8" },
      ),
    );
    const onboardingWarning = onboardPayload.details.dependency_warning;
    assert.match(onboardingWarning.message, /Missing commands: definitely-missing-command/);
    assert.match(
      onboardingWarning.message,
      /Missing MCP server configuration: definitely_missing_mcp_server_name/,
    );
    assert.match(onboardingWarning.message, /Affected skills: khuym:alpha/);

    const startupPayload = runSessionStartHook(root);
    const startupContext = startupPayload.hookSpecificOutput.additionalContext;
    assert.match(startupContext, /Missing commands: definitely-missing-command/);
    assert.match(
      startupContext,
      /Missing MCP server configuration: definitely_missing_mcp_server_name/,
    );
    assert.match(startupContext, /Affected skills: khuym:alpha/);

    const skillText = fs.readFileSync(LOCAL_USING_KHUYM_SKILL_PATH, "utf8");
    assert.match(skillText, /Missing commands:/);
    assert.match(skillText, /Missing MCP server configuration:/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("dependency helper marks missing command and missing mcp_server dependencies", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "khuym-deps-"));
  const skillsRoot = path.join(root, "plugins", "khuym", "skills");

  try {
    const alphaDir = path.join(skillsRoot, "alpha");
    fs.mkdirSync(alphaDir, { recursive: true });
    fs.writeFileSync(
      path.join(alphaDir, "SKILL.md"),
      [
        "---",
        "name: khuym:alpha",
        "metadata:",
        "  dependencies:",
        "    - id: must-have-command",
        "      kind: command",
        "      command: definitely-missing-command",
        "      missing_effect: unavailable",
        "      reason: required",
        "    - id: am-server",
        "      kind: mcp_server",
        "      server_names: [mcp_agent_mail]",
        "      config_sources: [repo_codex_config, global_codex_config]",
        "      missing_effect: degraded",
        "      reason: coordination",
        "---",
        "",
        "# alpha",
        "",
      ].join("\n"),
      "utf8",
    );

    const report = buildKhuymDependencyReport({
      repoRoot: root,
      skillsRoot,
      globalCodexConfigPath: path.join(root, "missing-global.toml"),
      commandProbe: () => ({ available: false, detail: "missing in test" }),
    });

    assert.equal(report.summary.skills_total, 1);
    assert.equal(report.summary.skills_available, 0);
    assert.equal(report.summary.skills_unavailable, 1);
    assert.equal(report.summary.missing_dependencies, 2);
    assert.equal(report.skills[0].status, "unavailable");
    assert.deepEqual(
      report.skills[0].missing_dependencies.map((dependency) => dependency.id).sort(),
      ["am-server", "must-have-command"],
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("packaged Khuym inventory stays fully covered and the docs explain the declaration contract", () => {
  const report = buildKhuymDependencyReport({ repoRoot: LOCAL_REPO_ROOT });
  const skillText = fs.readFileSync(LOCAL_USING_KHUYM_SKILL_PATH, "utf8");

  assert.equal(report.summary.skills_total, report.summary.skills_covered);
  assert.equal(report.summary.skills_uncovered, 0);
  assert.deepEqual(report.uncovered_skills, []);

  assert.match(skillText, /## Dependency Declaration Contract/);
  assert.match(skillText, /kind: command/);
  assert.match(skillText, /kind: mcp_server/);
  assert.match(skillText, /metadata\.dependencies: \[\]/);
  assert.match(
    skillText,
    /bash scripts\/check-markdown-links\.sh plugins\/khuym\/skills\/using-khuym\/SKILL\.md/,
  );
  assert.match(skillText, /bash scripts\/sync-skills\.sh --dry-run/);
});

test("getNodeRuntimeStatus enforces the minimum supported major version", () => {
  assert.equal(getNodeRuntimeStatus("18.0.0").supported, true);
  assert.equal(getNodeRuntimeStatus("17.9.1").supported, false);
});
