#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { scopeStudioCss } from "./hyperframes-embed-css.mjs";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const hyperframesRoot = repoRoot;
const distTag = process.env.HYPERFRAMES_YOUMIND_DIST_TAG ?? "youmind";
const stagingParent = join(repoRoot, ".youmind-publish");
const dryRun = process.argv.includes("--dry-run");
const packOnly = process.argv.includes("--pack");

for (const packageDir of ["studio-server", "studio"]) {
  const sourceRoot = join(hyperframesRoot, "packages", packageDir);
  const sourcePkg = JSON.parse(readFileSync(join(sourceRoot, "package.json"), "utf8"));
  const version = process.env.HYPERFRAMES_YOUMIND_VERSION ?? `${sourcePkg.version}-youmind.0`;
  const packageName = `@youmindinc/hyperframes-${packageDir}`;
  const stagingRoot = join(stagingParent, packageDir);
  if (!existsSync(join(sourceRoot, "dist", "index.d.ts"))) {
    throw new Error(`Build ${packageDir}, including its type declarations, before publishing`);
  }
  if (!dryRun && !packOnly) {
    try {
      execFileSync("npm", ["view", `${packageName}@${version}`, "version"], { stdio: "ignore" });
      console.log(`${packageName}@${version} already exists; skipping`);
      continue;
    } catch {
      /* Publish a new immutable version below. */
    }
  }

  const publishConfig = sourcePkg.publishConfig ?? {};
  const manifest = {
    ...sourcePkg,
    name: packageName,
    version,
    main: publishConfig.main ?? "./dist/index.js",
    types: publishConfig.types ?? "./dist/index.d.ts",
    exports: { ...(publishConfig.exports ?? sourcePkg.exports) },
    dependencies: Object.fromEntries(
      Object.entries(sourcePkg.dependencies ?? {}).map(([name, spec]) => [
        name,
        name === "@hyperframes/studio-server"
          ? `npm:@youmindinc/hyperframes-studio-server@${version}`
          : spec.startsWith("workspace:")
            ? sourcePkg.version
            : spec,
      ]),
    ),
    repository: {
      type: "git",
      url: "git+https://github.com/YouMindInc/hyperframes.git",
      directory: `packages/${packageDir}`,
    },
    publishConfig: { registry: "https://npm.pkg.github.com" },
  };
  manifest.scripts = undefined;
  manifest.devDependencies = undefined;
  if (JSON.stringify(manifest).match(/"(?:link|workspace|file):/)) {
    throw new Error("Published HyperFrames manifest must not contain local dependency references");
  }
  rmSync(stagingRoot, { recursive: true, force: true });
  mkdirSync(stagingRoot, { recursive: true });
  for (const entry of sourcePkg.files) {
    if (existsSync(join(sourceRoot, entry))) {
      cpSync(join(sourceRoot, entry), join(stagingRoot, entry), { recursive: true });
    }
  }
  if (packageDir === "studio") {
    writeFileSync(
      join(stagingRoot, "dist", "embed.css"),
      scopeStudioCss(readFileSync(join(stagingRoot, "dist", "styles.css"), "utf8")),
    );
    manifest.exports["./embed.css"] = "./dist/embed.css";
  }
  writeFileSync(join(stagingRoot, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const args = dryRun
    ? ["pack", "--dry-run", "--json"]
    : packOnly
      ? ["pack", "--pack-destination", stagingParent, "--json"]
      : ["publish", "--tag", distTag];
  console.log(
    `${dryRun ? "checking" : packOnly ? "packing" : "publishing"} ${packageName}@${version}`,
  );
  execFileSync("npm", args, {
    cwd: stagingRoot,
    env: {
      ...process.env,
      npm_config_userconfig:
        process.env.NPM_CONFIG_USERCONFIG ??
        process.env.npm_config_userconfig ??
        join(repoRoot, ".npmrc"),
    },
    stdio: "inherit",
  });
}
