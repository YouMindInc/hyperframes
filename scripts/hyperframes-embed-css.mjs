import postcss from "postcss";

// Compile upstream's standalone stylesheet into a scope, keeping the host's
// Tailwind theme and layout independent. Floating menus use the same scope.
export function scopeStudioCss(css) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
    if (rule.selector === "#root") {
      rule.remove();
      return;
    }
    rule.selector = rule.selector
      .replace(/:root|:host\b/g, ":scope")
      .replace(/(^|[\s,>+~])(?:html|body)(?=$|[\s,.#:[>+~])/g, "$1:scope");
  });
  const output = postcss.root();
  const scope = postcss.atRule({ name: "scope", params: "(.youcomputer-hyperframes-studio)" });
  for (const node of [...root.nodes]) {
    if (node.type === "atrule" && ["property", "charset"].includes(node.name)) output.append(node);
    else scope.append(node);
  }
  output.append(scope);
  return output.toString();
}
