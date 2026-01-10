# Nested Checkboxes

**Difficulty**: `medium`

## Goal
Build a nested checkbox tree component that manages selection states hierarchically. Selecting a parent should cascade selection to all children. Conversely, the selection state of children should bubble up to update the parent (checked, unchecked, or indeterminate).

## Requirements

### Core Functionality
1.  **Hierarchical Rendering**: Render a tree of checkboxes based on a recursive data structure.
2.  **Downward Cascade**: checking/unchecking a parent must check/uncheck all its descendants.
3.  **Upward Propagation**:
    *   If all children are checked, the parent becomes checked.
    *   If all children are unchecked, the parent becomes unchecked.
    *   If some children are checked and others are unchecked, the parent becomes **indeterminate**.
4.  **Indeterminate State**: Visually represent the indeterminate state (usually a dash or square) for parents with mixed descendants. Note: `<input type="checkbox">` has an `indeterminate` property that can only be set via JavaScript, not HTML attributes.

### Accessibility (A11y)
1.  Ensure labels are correctly associated with their inputs.
2.  Support keyboard navigation (Tab to focus, Space to toggle).
3.  The indeterminate state should be programmatically set so screen readers can announce "mixed" state appropriately.

## API Design

The component accepts an `items` array representing the tree roots.

```typescript
type TCheckboxItem = {
    id: string;
    label: string;
    selected?: boolean; 
    indeterminate?: boolean; // Optional, computed state
    children?: TCheckboxItem[];
}

interface CheckboxTreeProps {
    items: TCheckboxItem[];
}
```

## Solution Approach

1.  **State Management**:
    *   Use a flat map (Record<string, Item>) or recursive traversal to manage updates efficiently.
    *   When an item changes:
        *   **Cascade**: Recursively update all children to match the new value.
        *   **Bubble**: Recursively check the parent's state based on its children's new states.
2.  **Indeterminate Logic**:
    *   `parent.selected = children.every(c => c.selected)`
    *   `parent.indeterminate = !parent.selected && children.some(c => c.selected || c.indeterminate)`
3.  **Rendering**:
    *   Use recursion to render the nested lists (`<ul>`, `<li>`).
    *   Use a `ref` (React) or `afterRender` (Vanilla) to set `element.indeterminate = true` since strictly setting the attribute isn't enough.

## Test Cases

1.  **Select All**: Click a root parent -> All nested items become checked.
2.  **Deselect All**: Click root parent again -> All nested items become unchecked.
3.  **Partial Selection**: Select one child of a parent -> Parent becomes indeterminate.
4.  **Completion**: Select all remaining children of an indeterminate parent -> Parent becomes checked (not indeterminate).
5.  **Deep Nesting**: Verify logic holds for 3+ levels of depth.
