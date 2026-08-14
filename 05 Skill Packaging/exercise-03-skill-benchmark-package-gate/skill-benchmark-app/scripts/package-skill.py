#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path, PurePosixPath
import zipfile

APP_ROOT = Path(__file__).resolve().parents[1]
EXERCISE_ROOT = APP_ROOT.parent
SKILL_ROOT = APP_ROOT / "skills" / "incident-summary"
EVIDENCE_ROOT = EXERCISE_ROOT / "evidence"
ARCHIVE = EXERCISE_ROOT / "dist" / "incident-summary.skill"
ALLOWED_ROOTS = {"SKILL.md", "references", "scripts", "assets"}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def skill_manifest() -> tuple[list[dict[str, str]], str]:
    files = []
    for file in sorted(path for path in SKILL_ROOT.rglob("*") if path.is_file()):
        if file.is_symlink():
            raise SystemExit(f"Skill package must not contain symbolic link: {file.relative_to(SKILL_ROOT)}")
        relative = PurePosixPath(file.relative_to(SKILL_ROOT).as_posix())
        if "__pycache__" in relative.parts or "node_modules" in relative.parts or file.name == ".DS_Store" or file.suffix == ".pyc":
            continue
        if relative.parts[0] not in ALLOWED_ROOTS:
            raise SystemExit(f"Skill contains non-package file: {relative}")
        files.append({"file": str(relative), "sha256": digest(file.read_bytes())})
    if not any(item["file"] == "SKILL.md" for item in files):
        raise SystemExit("Skill package is missing SKILL.md")
    tree = "".join(f'{item["file"]}\0{item["sha256"]}\n' for item in files).encode()
    return files, digest(tree)


def main() -> None:
    benchmark_path = EVIDENCE_ROOT / "benchmark.json"
    if not benchmark_path.exists():
        raise SystemExit("Run npm run benchmark:aggregate before packaging.")
    benchmark = json.loads(benchmark_path.read_text(encoding="utf-8"))
    files, tree_hash = skill_manifest()
    if not benchmark.get("gate", {}).get("passed"):
        raise SystemExit("Benchmark gate has not passed.")
    if benchmark.get("metadata", {}).get("candidate_skill_sha256") != tree_hash:
        raise SystemExit("Current skill differs from the evaluated candidate.")

    ARCHIVE.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ARCHIVE, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for item in files:
            source = SKILL_ROOT / item["file"]
            info = zipfile.ZipInfo(f'incident-summary/{item["file"]}', date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, source.read_bytes())

    EVIDENCE_ROOT.mkdir(parents=True, exist_ok=True)
    package_manifest = {
        "schema_version": 1,
        "skill_name": "incident-summary",
        "skill_tree_sha256": tree_hash,
        "archive_sha256": digest(ARCHIVE.read_bytes()),
        "files": files,
    }
    (EVIDENCE_ROOT / "package-manifest.json").write_text(json.dumps(package_manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Packaged evaluated skill {tree_hash} to {ARCHIVE}")


if __name__ == "__main__":
    main()
