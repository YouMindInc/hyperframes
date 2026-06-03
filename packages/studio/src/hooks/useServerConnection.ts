import { useEffect, useState } from "react";
import {
  buildProjectHash,
  buildStudioApiPath,
  parseProjectIdFromHash,
} from "../utils/projectRouting";
import { useMountEffect } from "./useMountEffect";

interface ServerConnectionState {
  projectId: string | null;
  resolving: boolean;
  waitingForServer: boolean;
}

interface UseServerConnectionOptions {
  projectId?: string | null;
}

/**
 * Resolves the active project ID by pinging /api/projects.
 *
 * If the hash contains a project ID the server is still contacted — this
 * ensures a dead server (bookmark-reload case) enters the waiting state
 * rather than mounting the full Studio against a non-responsive API.
 *
 * Polls every 2 s until the server responds, then transitions automatically.
 * Cleans up pending timers on unmount so it is safe under React StrictMode.
 */
export function useServerConnection(
  options: UseServerConnectionOptions = {},
): ServerConnectionState {
  const explicitProjectId = options.projectId ?? null;
  const [projectId, setProjectId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(true);
  const [waitingForServer, setWaitingForServer] = useState(false);

  useMountEffect(() => {
    const hashProjectId = parseProjectIdFromHash(window.location.hash);
    let cancelled = false;
    let retryTimer: ReturnType<typeof window.setTimeout> | null = null;

    function scheduleRetry() {
      setWaitingForServer(true);
      retryTimer = window.setTimeout(tryConnect, 2000);
    }

    function tryConnect() {
      fetch(buildStudioApiPath("/projects"))
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (explicitProjectId || hashProjectId) {
            setProjectId(explicitProjectId ?? hashProjectId);
            setWaitingForServer(false);
          } else {
            const first = (data.projects ?? [])[0];
            if (first) {
              setProjectId(first.id);
              setWaitingForServer(false);
              window.location.hash = buildProjectHash(first.id);
            } else {
              scheduleRetry();
            }
          }
        })
        .catch(() => {
          if (!cancelled) scheduleRetry();
        })
        .finally(() => {
          if (!cancelled) setResolving(false);
        });
    }

    tryConnect();
    return () => {
      cancelled = true;
      if (retryTimer !== null) clearTimeout(retryTimer);
    };
  });

  // eslint-disable-next-line no-restricted-syntax
  useEffect(() => {
    const onHashChange = () => {
      if (explicitProjectId) return;
      const next = parseProjectIdFromHash(window.location.hash);
      if (next && next !== projectId) setProjectId(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [explicitProjectId, projectId]);

  return { projectId, resolving, waitingForServer };
}
