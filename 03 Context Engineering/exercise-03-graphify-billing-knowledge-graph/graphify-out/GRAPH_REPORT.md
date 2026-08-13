# Graph Report - .  (2026-08-13)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 108 nodes · 121 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5d9b3a63`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `scripts` - 12 edges
3. `LabContract` - 6 edges
4. `App()` - 5 edges
5. `lib` - 4 edges
6. `evidenceStatus()` - 3 edges
7. `readinessScore()` - 3 edges
8. `riskSummary()` - 3 edges
9. `EvidenceItem` - 2 edges
10. `RiskLevel` - 2 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `evidenceStatus()`  [EXTRACTED]
  src/App.tsx → src/skillWorkflow.ts
- `App()` --calls--> `readinessScore()`  [EXTRACTED]
  src/App.tsx → src/skillWorkflow.ts
- `App()` --calls--> `riskSummary()`  [EXTRACTED]
  src/App.tsx → src/skillWorkflow.ts

## Import Cycles
- None detected.

## Communities (13 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (15): App(), DecisionLog(), EvidenceLedger(), SkillPatternBoard(), labContract, root, evidenceStatus(), readinessScore() (+7 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (19): DOM, DOM.Iterable, ES2020, compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (12): scripts, agent:check, build, dev, format, lint, preview, test (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (11): devDependencies, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react, @types/react, @types/react-dom (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.20
Nodes (9): dependencies, react, react-dom, name, private, type, version, react (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (6): comparison, exerciseRoot, failures, queries, required, values

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (5): failures, files, missingSections, readme, requiredSections

### Community 7 - "Community 7"
Cohesion: 0.40
Nodes (4): contract, docsDir, failures, root

### Community 8 - "Community 8"
Cohesion: 0.50
Nodes (3): src, include, references

## Knowledge Gaps
- **64 isolated node(s):** `DecisionItem`, `BillingEvent`, `TenantAccountLink`, `root`, `riskWeight` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `scripts` connect `Community 2` to `Community 4`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 3` to `Community 4`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `Community 1` to `Community 8`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `DecisionItem`, `BillingEvent`, `TenantAccountLink` to the rest of the system?**
  _64 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._