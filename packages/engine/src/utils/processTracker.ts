import type { ChildProcess } from "node:child_process";

const tracked = new Set<ChildProcess>();

export function trackChildProcess(proc: ChildProcess): void {
  tracked.add(proc);
  const remove = () => tracked.delete(proc);
  proc.once("exit", remove);
  proc.once("error", remove);
}

export function killTrackedProcesses(signal: NodeJS.Signals = "SIGTERM"): void {
  for (const proc of tracked) {
    if (!proc.killed) {
      try {
        proc.kill(signal);
      } catch {
        // Best-effort — process may have already exited between the check and the kill.
      }
    }
  }
  tracked.clear();
}
