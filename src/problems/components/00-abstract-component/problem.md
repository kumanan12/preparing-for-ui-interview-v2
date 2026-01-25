# 00 Abstract Component

A base class for building vanilla JavaScript components with lifecycle methods.

## Overview

`AbstractComponent` provides a minimal framework for creating reusable UI components without a framework. It handles:

- DOM element creation
- Event listener management
- Component lifecycle (init, render, destroy)

## Architecture

```
┌────────────────────────────────────────────────┐
│              AbstractComponent                  │
├────────────────────────────────────────────────┤
│                                                 │
│  constructor(config)                            │
│       └── Store config, initialize state        │
│                                                 │
│  render()                                       │
│       ├── destroy() if already rendered         │
│       ├── init()                                │
│       │    ├── Create container element         │
│       │    └── Attach event listeners           │
│       ├── innerHTML = toHTML()                  │
│       ├── Append to root                        │
│       └── afterRender()                         │
│                                                 │
│  destroy()                                      │
│       ├── Remove event listeners                │
│       └── Remove from DOM                       │
│                                                 │
└────────────────────────────────────────────────┘
```

## API

```typescript
type TComponentConfig<T> = T & {
  root: HTMLElement // Parent element to mount into
  className?: string[] // CSS classes for container
  listeners?: string[] // Event types to bind (e.g., 'click')
  tag?: keyof HTMLElementTagNameMap // Container tag (default: 'div')
}

abstract class AbstractComponent<T extends object> {
  container: HTMLElement | null
  config: TComponentConfig<T>

  constructor(config: TComponentConfig<T>)

  // Lifecycle methods
  init(): void // Create container, bind events
  render(): void // Full render with cleanup
  afterRender(): void // Hook after DOM attachment
  destroy(): void // Cleanup and remove from DOM

  // Template method (override this)
  toHTML(): string // Return component's HTML
}
```

## Usage

```typescript
import { AbstractComponent } from './component'

class Counter extends AbstractComponent<{ initial: number }> {
  count: number

  constructor(config) {
    super({ ...config, listeners: ['click'] })
    this.count = config.initial
  }

  toHTML() {
    return `
      <button data-action="decrement">-</button>
      <span>${this.count}</span>
      <button data-action="increment">+</button>
    `
  }

  onClick(e: Event) {
    const action = (e.target as HTMLElement).dataset.action
    if (action === 'increment') this.count++
    if (action === 'decrement') this.count--
    this.render() // Re-render on state change
  }
}

// Usage
const counter = new Counter({
  root: document.getElementById('app')!,
  initial: 0,
})
counter.render()
```

## Event Handling

Events are declared in the `listeners` config and handled by methods named `on{Event}`:

| Listener    | Handler Method |
| ----------- | -------------- |
| `'click'`   | `onClick(e)`   |
| `'input'`   | `onInput(e)`   |
| `'change'`  | `onChange(e)`  |
| `'keydown'` | `onKeydown(e)` |

Events are automatically bound to the container element and cleaned up on destroy.

## Design Principles

1. **Minimal API** - Only essential lifecycle methods
2. **No magic** - Explicit event binding via config
3. **Clean cleanup** - Automatic event listener removal
4. **Composable** - Components can nest other components
