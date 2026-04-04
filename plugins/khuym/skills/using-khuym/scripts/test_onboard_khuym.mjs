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
    assert.ok(Array.isArray(payload.details.dependency_health.skills));
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
    assert.equal(warning.missing_dependencies_count, 2);
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

test("getNodeRuntimeStatus enforces the minimum supported major version", () => {
  assert.equal(getNodeRuntimeStatus("18.0.0").supported, true);
  assert.equal(getNodeRuntimeStatus("17.9.1").supported, false);
});
