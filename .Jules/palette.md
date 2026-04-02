## 2024-03-24 - Accessibility Labels on Icon-Only Buttons
**Learning:** Found that secondary navigation actions (like user profiles) and inline actions in lists (like edit/delete on notes) often use icon-only buttons without accessible names, reducing screen reader compatibility.
**Action:** When working on lists or header navigation, explicitly verify that all `Button` components rendering only an icon have an `aria-label` attribute describing their action.
