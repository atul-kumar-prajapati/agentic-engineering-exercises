import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const SOURCE_ROOT = "src/notification";
const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".ts", ".tsx"]);

function normalized(relative) {
  return relative.split(path.sep).join("/");
}

function sourceFiles(appRoot) {
  const root = path.join(appRoot, SOURCE_ROOT);
  const found = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) found.push(normalized(path.relative(appRoot, absolute)));
    }
  }
  visit(root);
  return found.sort();
}

function resolveImport(sourcePath, specifier, paths) {
  if (!specifier.startsWith(".")) return null;
  const unresolved = normalized(path.join(path.dirname(sourcePath), specifier));
  const candidates = path.extname(unresolved)
    ? [unresolved]
    : [...SOURCE_EXTENSIONS].map((extension) => `${unresolved}${extension}`);
  return candidates.find((candidate) => paths.has(candidate)) ?? null;
}

function functionId(sourcePath, name) {
  return `function:${sourcePath}#${name}`;
}

function fileId(sourcePath) {
  return `file:${sourcePath}`;
}

function edgeId(kind, from, to) {
  const digest = crypto.createHash("sha256").update(`${kind}|${from}|${to}`).digest("hex").slice(0, 12);
  return `${kind}:${digest}`;
}

function addEdge(edges, edge) {
  const existing = edges.find((item) => item.kind === edge.kind && item.from === edge.from && item.to === edge.to);
  if (existing) {
    existing.source_lines = [...new Set([...existing.source_lines, ...edge.source_lines])].sort((a, b) => a - b);
    return;
  }
  edges.push(edge);
}

function exported(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

export function buildCodeGraph(appRoot, sourceSha) {
  const paths = sourceFiles(appRoot);
  const pathSet = new Set(paths);
  const parsed = new Map();
  const nodes = [];
  const edges = [];

  for (const sourcePath of paths) {
    const source = fs.readFileSync(path.join(appRoot, sourcePath), "utf8");
    const tree = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true, sourcePath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.JS);
    parsed.set(sourcePath, { source, tree });
    nodes.push({ id: fileId(sourcePath), kind: "file", name: path.basename(sourcePath), path: sourcePath, line: 1 });
    tree.forEachChild((node) => {
      if (ts.isFunctionDeclaration(node) && node.name && exported(node)) {
        const line = tree.getLineAndCharacterOfPosition(node.name.getStart(tree)).line + 1;
        nodes.push({ id: functionId(sourcePath, node.name.text), kind: "function", name: node.name.text, path: sourcePath, line });
      }
    });
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const sourcePath of paths) {
    const { tree } = parsed.get(sourcePath);
    const imports = new Map();
    for (const statement of tree.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const targetPath = resolveImport(sourcePath, statement.moduleSpecifier.text, pathSet);
      if (!targetPath) continue;
      const line = tree.getLineAndCharacterOfPosition(statement.getStart(tree)).line + 1;
      const from = fileId(sourcePath);
      const to = fileId(targetPath);
      addEdge(edges, { id: edgeId("imports", from, to), kind: "imports", from, to, source_path: sourcePath, source_lines: [line], evidence: "direct" });
      const bindings = statement.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) imports.set(element.name.text, { imported: element.propertyName?.text ?? element.name.text, targetPath });
      }
    }

    let currentFunction = null;
    function visit(node) {
      const previousFunction = currentFunction;
      if (ts.isFunctionDeclaration(node) && node.name && exported(node)) currentFunction = node.name.text;
      if (currentFunction && ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const target = imports.get(node.expression.text);
        if (target) {
          const from = functionId(sourcePath, currentFunction);
          const to = functionId(target.targetPath, target.imported);
          if (nodeIds.has(from) && nodeIds.has(to)) {
            const line = tree.getLineAndCharacterOfPosition(node.expression.getStart(tree)).line + 1;
            addEdge(edges, { id: edgeId("calls", from, to), kind: "calls", from, to, source_path: sourcePath, source_lines: [line], evidence: "direct" });
          }
        }
      }
      ts.forEachChild(node, visit);
      currentFunction = previousFunction;
    }
    visit(tree);
  }

  return {
    schema_version: 1,
    source_sha: sourceSha,
    scope: `${SOURCE_ROOT}/**/*.{js,mjs,ts,tsx}`,
    nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
    edges: edges.sort((a, b) => a.id.localeCompare(b.id)),
  };
}

export function findSymbol(graph, name) {
  const matches = graph.nodes.filter((node) => node.kind === "function" && node.name === name);
  if (matches.length !== 1) throw new Error(`Expected one function named ${name}; found ${matches.length}`);
  return matches[0];
}

export function normalizedGraph(graph) {
  return {
    schema_version: graph.schema_version,
    source_sha: graph.source_sha,
    scope: graph.scope,
    nodes: [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...graph.edges].sort((a, b) => a.id.localeCompare(b.id)),
  };
}
