# Toast Component

**Difficulty**: `Easy`

## Goal
Create a notification system that displays brief, auto-expiring messages to the user. Toasts should appear non-intrusively and automatically dismiss themselves after a set duration.

## Requirements

### Core Functionality
1.  **Display**: Show a toast message with provided text content.
2.  **Positioning**: Toasts should stack (usually at the bottom or top corner of the screen).
3.  **Auto-dismiss**: Messages should disappear automatically after a configured timeout (e.g., 3000ms).
4.  **Animation**: New toasts should fade in/slide in, and expiring toasts should fade out/slide out smoothly.
5.  **Queueing**: Multiple toasts should stack comfortably without overlapping.

### Accessibility (A11y)
1.  **Role**: Use `role="status"` or `role="alert"` depending on importance.
2.  **Live Region**: Toasts should be inside an `aria-live` region so screen readers announce them.
3.  **Focus Management**: Focus should strictly NOT move to the toast automatically (unless it requires action).

## API Design

The component should support an imperative API for triggering toasts, for example:

```javascript
// Generic signature
toast({
  text: "Operation successful",
  duration: 3000
});
```

## Solution Approach

1.  **Container**: Create a fixed-position container in the DOM to hold the toast list.
2.  **State Management**: Maintain a list of active toast items.
3.  **Mounting**:
    *   **React**: Use a Context + Portal to render the container and expose the `toast()` function hook.
    *   **Vanilla**: Use a Singleton or Class instance to append elements to the container.
4.  **Animation Handling**: Use CSS Animations or Transitions. Ensure the element is removed from the DOM *after* the exit animation completes (use `animationend` event).
