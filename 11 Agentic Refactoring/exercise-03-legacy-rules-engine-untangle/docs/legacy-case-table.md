# Legacy Case Table

| Case | Result | Repository effect |
|---|---|---|
| Missing ID plus invalid Ready note | Not found | none |
| Ready note length 11 | exact invalid-decision error | zero saves |
| Ready note length 12 | accepted item | one save |
| Unknown non-Ready status | accepted item | one save |
| Valid Blocked decision | protected fields preserved | one save |

Do not add new status validation or normalize evidence text during this extraction.
