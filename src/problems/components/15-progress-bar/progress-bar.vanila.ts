import { AbstractComponent } from '../00-abstract-component/component'
import css from './progress-bar.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

type TProgressBarProps = {
  value: number
  max?: number
  label?: string
}

export class ProgressBar extends AbstractComponent<TProgressBarProps> {
  private progressEl: HTMLElement | null = null
  private labelOverlayEl: HTMLElement | null = null

  constructor(config: TProgressBarProps & { root: HTMLElement }) {
    super(config)
    this.config.max = this.config.max ?? 100
  }

  private get percentage(): number {
    const { value, max } = this.config
    return Math.min(100, Math.max(0, (value / max!) * 100))
  }

  toHTML(): string {
    const { label, value, max } = this.config
    const pct = this.percentage

    return `
            <div
                role="progressbar"
                aria-valuenow="${value}"
                aria-valuemin="0"
                aria-valuemax="${max}"
                aria-label="${label ?? `Progress: ${pct}%`}"
                class="${css['progress-bar']}"
            >
                <div
                    class="${css.progress}"
                    style="transform: translateX(-${100 - pct}%)"
                ></div>
                ${
                  label
                    ? `
                    <div class="${cx(css.label, flex.flexRowCenter, flex.itemsCenter, flex.justifyCenter)}">
                        ${label}
                    </div>
                    <div
                        class="${cx(css.labelOverlay, flex.flexRowCenter, flex.itemsCenter, flex.justifyCenter)}"
                        style="clip-path: inset(0 ${100 - pct}% 0 0)"
                        aria-hidden="true"
                    >
                        ${label}
                    </div>
                `
                    : ''
                }
            </div>
        `
  }

  afterRender() {
    this.progressEl = this.container!.querySelector(`.${css.progress}`)
    this.labelOverlayEl = this.container!.querySelector(`.${css.labelOverlay}`)
  }

  /**
   * Update the progress bar value.
   */
  setValue(value: number) {
    this.config.value = value
    const pct = this.percentage

    if (this.progressEl) {
      this.progressEl.style.transform = `translateX(-${100 - pct}%)`
    }
    if (this.labelOverlayEl) {
      this.labelOverlayEl.style.clipPath = `inset(0 ${100 - pct}% 0 0)`
    }

    // Update ARIA
    const wrapper = this.container?.querySelector('[role="progressbar"]')
    if (wrapper) {
      wrapper.setAttribute('aria-valuenow', String(value))
      wrapper.setAttribute('aria-label', this.config.label ?? `Progress: ${pct}%`)
    }
  }
}
