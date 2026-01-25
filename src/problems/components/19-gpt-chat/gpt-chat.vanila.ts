import { AbstractComponent } from '../00-abstract-component/component'
import css from './gpt-chat.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

type TGPTChatProps = {
  delay?: number
}

export class GPTChat extends AbstractComponent<TGPTChatProps> {
  private content: string = ''
  private chunks: string[] = []
  private isTyping: boolean = false
  private inProgress: boolean = false
  private controller: AbortController | null = null

  private contentEl: HTMLElement | null = null
  private buttonEl: HTMLButtonElement | null = null

  constructor(config: TGPTChatProps & { root: HTMLElement }) {
    super({ ...config, listeners: ['click'] })
    this.config.delay = this.config.delay ?? 500
  }

  toHTML(): string {
    return `
            <div class="${css.container}">
                <section class="${css.content}"></section>
                <section class="${cx(flex.flexRowCenter, flex.flexGap32)}">
                    <textarea class="${css.textarea}"></textarea>
                    <button class="${css.button}">${this.inProgress ? 'Stop' : 'Send'}</button>
                </section>
            </div>
        `
  }

  afterRender() {
    this.contentEl = this.container!.querySelector(`.${css.content}`)
    this.buttonEl = this.container!.querySelector(`.${css.button}`)
  }

  onClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.matches(`.${css.button}`)) {
      if (this.inProgress) {
        this.abort()
      } else {
        this.handleSend()
      }
    }
  }

  private handleSend() {
    this.content = ''
    this.chunks = []
    this.updateContent()
    this.stream((chunk) => {
      this.chunks.push(chunk)
      this.processChunks()
    })
  }

  private async stream(onChunk: (chunk: string) => void) {
    this.controller?.abort()
    this.controller = new AbortController()
    this.inProgress = true
    this.updateButton()

    try {
      const response = await fetch(
        `http://localhost:3000/api/stream-markdown?delay=${this.config.delay}`,
        { signal: this.controller.signal },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No readable stream available')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        onChunk(text)
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Stream error:', error)
      }
    } finally {
      this.controller = null
      this.inProgress = false
      this.updateButton()
    }
  }

  private abort() {
    this.controller?.abort()
    this.controller = null
    this.inProgress = false
    this.updateButton()
  }

  private processChunks() {
    if (!this.isTyping && this.chunks.length > 0) {
      this.isTyping = true
      const nextChunk = this.chunks.shift()!
      this.type(nextChunk)
    }
  }

  private type(chunk: string) {
    if (chunk.length === 0) {
      this.isTyping = false
      this.processChunks()
      return
    }

    const charsToType = 2
    const chars = chunk.slice(0, charsToType)
    const rest = chunk.slice(charsToType)

    this.content += chars
    this.updateContent()

    if (rest.length > 0) {
      requestAnimationFrame(() => this.type(rest))
    } else {
      this.isTyping = false
      this.processChunks()
    }

    this.contentEl?.scrollTo({
      top: this.contentEl.scrollHeight,
      behavior: 'smooth',
    })
  }

  private updateContent() {
    if (this.contentEl) {
      // Simple markdown-to-HTML (basic: just escape and preserve newlines)
      // For full markdown, you'd integrate a parser
      this.contentEl.innerHTML = this.escapeHtml(this.content).replace(/\n/g, '<br>')
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  private updateButton() {
    if (this.buttonEl) {
      this.buttonEl.textContent = this.inProgress ? 'Stop' : 'Send'
    }
  }
}
