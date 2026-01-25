# Progress Bar

**Difficulty**: `easy`

## Goal

Build a progress bar component that visually indicates completion percentage with smooth animations and an optional text label that changes color as the bar fills.

## Requirements

### Core Functionality

1.  **Progress Visualization**: Display a filled bar representing the current value as a percentage of the max.
2.  **Smooth Animation**: Animate the progress bar width using CSS `transform: translateX()` for GPU-accelerated rendering.
3.  **Label Support**: Optionally display a text label centered on the bar.
4.  **Label Color Inversion**: Use `clip-path` to create a "knockout" effect where the label text is dark on the unfilled portion and white on the filled portion.
5.  **Dynamic Updates**: Support updating the value programmatically (vanilla) or via props (React).

### Accessibility (A11y)

1.  Use `role="progressbar"` with proper ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
2.  Provide an `aria-label` describing the current progress.

## API Design

### Props

- `value`: `number` - Current progress value.
- `max`: `number` (optional, default `100`) - Maximum value.
- `label`: `string` (optional) - Text to display on the bar.

### Vanilla Methods

- `setValue(value: number)`: Update the progress value and animate the bar.

## Solution Approach

### React

1.  Compute `percentage = (value / max) * 100`.
2.  Apply `transform: translateX(-${100 - percentage}%)` to the progress fill.
3.  Duplicate the label element: one with dark text (behind) and one with white text (in front, clipped).
4.  Use `clip-path: inset(0 ${100 - percentage}% 0 0)` on the overlay label.

### Vanilla

1.  Extend `AbstractComponent`, render initial HTML with inline styles.
2.  In `setValue()`, update style properties on `progressEl` and `labelOverlayEl`.
3.  Update ARIA attributes on value change.

## Verification

1.  Set value to 0 → bar empty, label dark.
2.  Set value to 50 → bar half-filled, label is half dark / half white.
3.  Set value to 100 → bar full, label fully white.
4.  Animate value from 0 to 100 → smooth transition.
