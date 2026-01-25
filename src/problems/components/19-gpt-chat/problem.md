# GPT Chat

**Difficulty**: `medium`

## Goal

Build a chat interface that streams responses from a server and displays them with a typing animation, simulating a GPT-style conversational AI.

## Requirements

### Core Functionality

1.  **Streaming Fetch**: Use the Fetch API with `ReadableStream` to consume server-sent chunks in real-time.
2.  **Typing Animation**: Display streamed content character-by-character using `requestAnimationFrame` for smooth animation.
3.  **Abort Support**: Allow the user to stop an in-progress stream via an abort button.
4.  **Chunk Buffering**: Buffer incoming chunks and process them sequentially to handle network bursts gracefully.
5.  **Auto-Scroll**: Automatically scroll the content area to the bottom as new content arrives.

### Accessibility (A11y)

1.  The content area should be a live region (`aria-live="polite"`) to announce new content to screen readers.
2.  The Send/Stop button should have clear labels.

## API Design

### Backend Endpoint

- `GET /api/stream-markdown?delay=<ms>` - Returns a streaming response of markdown text.

### React Hook

- `useMarkdownStream(options?)` - Returns `{ stream, abort, inProgress }`.

### Props (Vanilla)

- `delay`: `number` (optional, default `500`) - Delay parameter passed to the API.

## Solution Approach

### React

1.  Use `useRef` for `AbortController` to manage stream lifecycle.
2.  Store incoming chunks in state array.
3.  Use `useEffect` to trigger typing animation when chunks arrive.
4.  Type characters recursively with `requestAnimationFrame`.

### Vanilla

1.  Extend `AbstractComponent` with internal state for `content`, `chunks`, `isTyping`, `inProgress`.
2.  Implement `stream()` method using fetch and `ReadableStream`.
3.  Use `processChunks()` to dequeue and animate.
4.  Update DOM directly in `updateContent()` and `updateButton()`.

## Verification

1.  Click "Send" → content streams in with typing effect.
2.  Click "Stop" mid-stream → stream aborts, button reverts to "Send".
3.  Rapid "Send" clicks → previous stream aborts, new one starts.
4.  Content auto-scrolls as it grows.
