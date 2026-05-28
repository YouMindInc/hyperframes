import { execFileSync } from "node:child_process";

/**
 * Locate the first python3 binary on PATH. Returns undefined when no Python 3
 * is available (older Python 2 binaries are skipped via the version check).
 */
export function findPython(): string | undefined {
  for (const name of ["python3", "python"]) {
    try {
      const cmd = process.platform === "win32" ? "where" : "which";
      const output = execFileSync(cmd, [name], {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 5000,
      });
      const first = output
        .split(/\r?\n/)
        .map((s) => s.trim())
        .find(Boolean);
      if (!first) continue;

      const version = execFileSync(first, ["--version"], {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 5000,
      }).trim();

      if (version.includes("Python 3")) return first;
    } catch {
      // not found
    }
  }
  return undefined;
}

export function hasPythonPackage(python: string, pkg: string): boolean {
  try {
    execFileSync(python, ["-c", `import ${pkg}`], {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 10_000,
    });
    return true;
  } catch {
    return false;
  }
}
