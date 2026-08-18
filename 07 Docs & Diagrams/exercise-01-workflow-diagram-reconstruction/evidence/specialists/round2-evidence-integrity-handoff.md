# Round-Two Evidence Integrity Handoff

Scope: hashes, Git source binding, two-branch process proof, submission-contract coverage, protected-input immutability, and end-to-end gates. Read-only; no files modified, no mutating Git commands.

Verification: `npm run test:integrity` exited `0`; `npm run verify:exercise` exited `0`.

## Findings

- **Hashes**: all seven values recorded in `diagram-manifest.json` recomputed with `shasum -a 256` and matched byte-for-byte — three diagrams, `traceability.json`, `contradictions.md`, and both captured command outputs.
- **Source binding**: the recorded `source_sha` was a real commit, an ancestor of `HEAD`, and agreed across `diagram-manifest.json`, `traceability.json`, `verification.md`, `after.md`, and both command outputs. All ten cited source lines were read back at that SHA with `git show` and matched their recorded excerpts exactly.
- **Two-branch process**: `git merge-base` of the before and after branches is `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`, the starting commit both `before.md` and `after.md` claim. The before branch genuinely carries the naive document-led diagrams — including the unsupported `Provisioning --> Provisioning` retry edge and no `%% EDGE:` markers — and none of the after-branch artifacts leaked backwards. `before.patch` and `after.patch` match their real Git diffs apart from file ordering and stripped trailing whitespace. Session conditions recorded in the two files match on agent, model, tools, permissions, time limit, and first-attempt condition; the only stated difference is the deliberate independent variable.
- **Submission contract**: all nine required files exist, exceed their `minCharacters`, contain every `includeAll` string, and parse as JSON where required; all three required directories are present. `comparison.md` covers unsupported edges, missing paths, and final coverage.
- **Protected inputs**: all sixteen files in `challenge-integrity.json` are unmodified across the exercise commits, and every changed path lies inside the exercise directory.

No integrity failure was found. Two cosmetic observations were raised: `before.md` on the after branch is a lightly reworded copy of the before-branch original with the same conditions and numbers, and the stored patches have had trailing whitespace stripped and file order rearranged relative to raw `git diff`.

## Integration Disposition

No defect required correction in this lane. Both cosmetic observations were accepted as-is: the patch normalisation is a formatting artifact with faithful content, and the reworded `before.md` preserves every recorded condition and measurement.

Because the round-two diagram corrections changed two `.mmd` files, this lane's constraints were re-applied by the integration owner: the corrected diagrams were committed first as the new `source_sha`, both command outputs were re-captured while `HEAD` equalled that commit so they name it, every manifest hash was recomputed, and the evidence commit that follows touches only `evidence/` paths — the condition `scripts/diagram-verification.mjs:211-216` enforces.
