#!/usr/bin/env python3
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import zipfile

sys.dont_write_bytecode = True
SCRIPT_ROOT = Path(__file__).resolve().parent


def load_script(name: str, filename: str):
    specification = importlib.util.spec_from_file_location(name, SCRIPT_ROOT / filename)
    module = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(module)
    return module


def point_at_workspace(module, app_root: Path) -> None:
    module.APP_ROOT = app_root
    module.EXERCISE_ROOT = app_root.parent
    module.SKILL_ROOT = app_root / "skills" / "incident-summary"
    module.EVIDENCE_ROOT = app_root.parent / "evidence"
    module.ARCHIVE = app_root.parent / "dist" / "incident-summary.skill"


def main() -> None:
    packager = load_script("benchmark_packager", "package-skill.py")
    verifier = load_script("benchmark_package_verifier", "verify-skill-package.py")
    with tempfile.TemporaryDirectory(prefix="skill-package-self-test-") as temporary:
        app_root = Path(temporary) / "app"
        skill_root = app_root / "skills" / "incident-summary"
        skill_root.mkdir(parents=True)
        source = SCRIPT_ROOT.parent / "fixtures" / "incident-summary-starter" / "SKILL.md"
        (skill_root / "SKILL.md").write_bytes(source.read_bytes())
        point_at_workspace(packager, app_root)
        point_at_workspace(verifier, app_root)

        _, tree_hash = packager.skill_manifest()
        packager.EVIDENCE_ROOT.mkdir(parents=True)
        benchmark = {"metadata": {"candidate_skill_sha256": tree_hash}, "gate": {"passed": True}}
        (packager.EVIDENCE_ROOT / "benchmark.json").write_text(json.dumps(benchmark), encoding="utf-8")
        packager.main()
        verifier.main()
        if not packager.ARCHIVE.exists():
            raise AssertionError("package command did not create the archive")

        with zipfile.ZipFile(packager.ARCHIVE, "a") as archive:
            archive.writestr("incident-summary/unexpected.txt", "not evaluated")
        try:
            verifier.main()
        except SystemExit as error:
            if "unexpected file" not in str(error):
                raise AssertionError("tampered archive failed for the wrong reason") from error
        else:
            raise AssertionError("tampered archive unexpectedly passed verification")
    print("skill package framework self-test passed")


if __name__ == "__main__":
    main()
