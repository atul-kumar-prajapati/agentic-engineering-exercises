#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path, PurePosixPath
import stat
import zipfile

APP_ROOT = Path(__file__).resolve().parents[1]
EXERCISE_ROOT = APP_ROOT.parent
SKILL_ROOT = APP_ROOT / "skills" / "incident-summary"
EVIDENCE_ROOT = EXERCISE_ROOT / "evidence"
ARCHIVE = EXERCISE_ROOT / "dist" / "incident-summary.skill"
ALLOWED_ROOTS = {"SKILL.md", "references", "scripts", "assets"}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def disk_manifest() -> tuple[list[dict[str, str]], str]:
    files = []
    for file in sorted(path for path in SKILL_ROOT.rglob("*") if path.is_file()):
        if file.is_symlink():
            raise ValueError(f"skill package must not contain symbolic link: {file.relative_to(SKILL_ROOT)}")
        relative = PurePosixPath(file.relative_to(SKILL_ROOT).as_posix())
        if "__pycache__" in relative.parts or "node_modules" in relative.parts or file.name == ".DS_Store" or file.suffix == ".pyc":
            continue
        if relative.parts[0] not in ALLOWED_ROOTS:
            raise ValueError(f"skill contains non-package file: {relative}")
        files.append({"file": str(relative), "sha256": digest(file.read_bytes())})
    tree = "".join(f'{item["file"]}\0{item["sha256"]}\n' for item in files).encode()
    return files, digest(tree)


def main() -> None:
    failures = []
    manifest_path = EVIDENCE_ROOT / "package-manifest.json"
    benchmark_path = EVIDENCE_ROOT / "benchmark.json"
    if not ARCHIVE.exists():
        failures.append("missing dist/incident-summary.skill")
    if not manifest_path.exists():
        failures.append("missing evidence/package-manifest.json")
    if not benchmark_path.exists():
        failures.append("missing evidence/benchmark.json")
    if failures:
        raise SystemExit("Package verification failed:\n- " + "\n- ".join(failures))

    try:
        disk_files, tree_hash = disk_manifest()
        submitted_manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        benchmark = json.loads(benchmark_path.read_text(encoding="utf-8"))
        if submitted_manifest != {
            "schema_version": 1,
            "skill_name": "incident-summary",
            "skill_tree_sha256": tree_hash,
            "archive_sha256": digest(ARCHIVE.read_bytes()),
            "files": disk_files,
        }:
            failures.append("package manifest does not match the current skill and archive")
        if benchmark.get("metadata", {}).get("candidate_skill_sha256") != tree_hash:
            failures.append("archive skill differs from the benchmarked candidate")
        if not benchmark.get("gate", {}).get("passed"):
            failures.append("benchmark gate is not passing")

        expected_paths = {f'incident-summary/{item["file"]}': item for item in disk_files}
        with zipfile.ZipFile(ARCHIVE, "r") as archive:
            infos = [info for info in archive.infolist() if not info.is_dir()]
            seen = set()
            for info in infos:
                name = PurePosixPath(info.filename)
                if name.is_absolute() or ".." in name.parts or len(name.parts) < 2 or name.parts[0] != "incident-summary":
                    failures.append(f"unsafe archive path: {info.filename}")
                    continue
                mode = info.external_attr >> 16
                if mode and stat.S_ISLNK(mode):
                    failures.append(f"archive contains symlink: {info.filename}")
                if info.filename in seen:
                    failures.append(f"archive contains duplicate path: {info.filename}")
                seen.add(info.filename)
                if info.filename not in expected_paths:
                    failures.append(f"archive contains unexpected file: {info.filename}")
                    continue
                if digest(archive.read(info)) != expected_paths[info.filename]["sha256"]:
                    failures.append(f"archive file differs from evaluated skill: {info.filename}")
            missing = set(expected_paths) - seen
            for name in sorted(missing):
                failures.append(f"archive is missing evaluated file: {name}")
    except (OSError, ValueError, json.JSONDecodeError, zipfile.BadZipFile) as error:
        failures.append(str(error))

    if failures:
        raise SystemExit("Package verification failed:\n- " + "\n- ".join(failures))
    print(f"Package exactly matches evaluated skill tree {tree_hash}.")


if __name__ == "__main__":
    main()
