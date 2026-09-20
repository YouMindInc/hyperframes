#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { scopeStudioCss } from "./hyperframes-embed-css.mjs";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const sourceVersion = JSON.parse(
  readFileSync(join(repoRoot, "packages/studio/package.json"), "utf8"),
).version;
const tagMatch = process.env.GITHUB_REF_NAME?.match(/^youmind-studio-(\d+\.\d+\.\d+)\.(\d+)$/);
const version =
  process.env.HYPERFRAMES_YOUMIND_VERSION ??
  (tagMatch ? `${tagMatch[1]}-youmind.${tagMatch[2]}` : `${sourceVersion}-youmind.0`);
if (!version.startsWith(`${sourceVersion}-youmind.`))
  throw new Error("Package version must match the upstream source version");
const tag = `youmind-studio-${version.replace("-youmind.", ".")}`;
const repository = "YouMindInc/hyperframes";
const releaseBase = `https://github.com/${repository}/releases/download/${tag}`;
const stagingParent = join(repoRoot, ".youmind-publish");
const dryRun = process.argv.includes("--dry-run");
const publish = process.argv.includes("--publish");
const tarballs = [];

for (const packageDir of ["studio-server", "studio"]) {
  const sourceRoot = join(repoRoot, "packages", packageDir);
  const sourcePkg = JSON.parse(readFileSync(join(sourceRoot, "package.json"), "utf8"));
  if (sourcePkg.version !== sourceVersion) throw new Error("Studio and server versions must match");
  const packageName = `@youmindinc/hyperframes-${packageDir}`;
  const stagingRoot = join(stagingParent, packageDir);
  if (!existsSync(join(sourceRoot, "dist", "index.d.ts"))) {
    throw new Error(`Build ${packageDir}, including its type declarations, before packaging`);
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
          ? `${releaseBase}/youmindinc-hyperframes-studio-server-${version}.tgz`
          : spec.startsWith("workspace:")
            ? sourceVersion
            : spec,
      ]),
    ),
    repository: {
      type: "git",
      url: `git+https://github.com/${repository}.git`,
      directory: `packages/${packageDir}`,
    },
    publishConfig: { registry: "https://npm.pkg.github.com" },
    scripts: undefined,
    devDependencies: undefined,
  };
  if (JSON.stringify(manifest).match(/"(?:link|workspace|file):/)) {
    throw new Error("Released HyperFrames manifest must not contain local dependency references");
  }
  rmSync(stagingRoot, { recursive: true, force: true });
  mkdirSync(stagingRoot, { recursive: true });
  for (const entry of sourcePkg.files) {
    if (existsSync(join(sourceRoot, entry)))
      cpSync(join(sourceRoot, entry), join(stagingRoot, entry), { recursive: true });
  }
  if (packageDir === "studio") {
    writeFileSync(
      join(stagingRoot, "dist/embed.css"),
      scopeStudioCss(readFileSync(join(stagingRoot, "dist/styles.css"), "utf8")),
    );
    manifest.exports["./embed.css"] = "./dist/embed.css";
  }
  writeFileSync(join(stagingRoot, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  execFileSync(
    "npm",
    dryRun
      ? ["pack", "--dry-run", "--json"]
      : ["pack", "--pack-destination", stagingParent, "--json"],
    { cwd: stagingRoot, stdio: "inherit" },
  );
  tarballs.push(join(stagingParent, `youmindinc-hyperframes-${packageDir}-${version}.tgz`));
}

if (publish && !dryRun) {
  const existing = spawnSync(
    "gh",
    ["release", "view", tag, "--repo", repository, "--json", "assets"],
    { cwd: repoRoot, encoding: "utf8" },
  );
  if (existing.status === 0) {
    const assetNames = new Set(JSON.parse(existing.stdout).assets.map((asset) => asset.name));
    const expectedNames = ["studio-server", "studio"].map(
      (name) => `youmindinc-hyperframes-${name}-${version}.tgz`,
    );
    if (!expectedNames.every((name) => assetNames.has(name))) {
      throw new Error(`Release ${tag} exists but is incomplete; refusing to overwrite it`);
    }
    console.log(`Release ${tag} already contains both packages; leaving it unchanged`);
    process.exit(0);
  }
  // Do not overwrite an existing release; published tarball URLs are immutable pins.
  execFileSync(
    "gh",
    [
      "release",
      "create",
      tag,
      ...tarballs,
      "--repo",
      repository,
      "--verify-tag",
      "--title",
      `YouMind Studio ${version}`,
      "--notes",
      `HyperFrames ${sourceVersion} with YouMind host embedding. Pinned Studio and Studio Server packages; no credentials or user content included.`,
    ],
    { cwd: repoRoot, stdio: "inherit" },
  );
}
