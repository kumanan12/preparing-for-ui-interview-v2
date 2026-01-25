import { useState, useEffect, useRef } from 'react'
import { ProgressBar } from './progress-bar.react'
import { ProgressBar as VanillaProgressBar } from './progress-bar.vanila'

/**
 * Example component demonstrating the ProgressBar with animation.
 * Progress increases by 5-15% every 500ms from 0 to 100.
 */
export const ProgressBarExample = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (progress >= 100) return

    const timer = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.floor(Math.random() * 11) + 5 // 5-15
        const next = prev + increment
        return next >= 100 ? 100 : next
      })
    }, 500)

    return () => clearInterval(timer)
  }, [progress])

  const handleReset = () => setProgress(0)

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>React Progress Bar</h3>
      <div style={{ marginTop: '16px' }}>
        <ProgressBar value={progress} label={`${progress}%`} />
      </div>
      <button onClick={handleReset} style={{ marginTop: '16px' }} disabled={progress < 100}>
        Reset
      </button>
    </div>
  )
}

export const ProgressBarVanillaExample = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<VanillaProgressBar | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!rootRef.current) return
    instanceRef.current = new VanillaProgressBar({
      root: rootRef.current,
      value: 0,
      label: '0%',
    })
    instanceRef.current.render()

    return () => {
      instanceRef.current?.destroy()
      instanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (progress >= 100) return

    const timer = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.floor(Math.random() * 11) + 5
        const next = prev + increment
        return next >= 100 ? 100 : next
      })
    }, 500)

    return () => clearInterval(timer)
  }, [progress])

  useEffect(() => {
    instanceRef.current?.setValue(progress)
    // Update label manually since setValue doesn't re-render
    const labelEls = rootRef.current?.querySelectorAll('[class*="label"]')
    labelEls?.forEach((el) => {
      if (el.getAttribute('aria-hidden') !== 'true' || el.getAttribute('aria-hidden') === 'true') {
        el.textContent = `${progress}%`
      }
    })
  }, [progress])

  const handleReset = () => setProgress(0)

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>Vanilla Progress Bar</h3>
      <div ref={rootRef} style={{ marginTop: '16px' }} />
      <button onClick={handleReset} style={{ marginTop: '16px' }} disabled={progress < 100}>
        Reset
      </button>
    </div>
  )
}
