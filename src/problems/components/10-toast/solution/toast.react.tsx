import {
  createContext,
  type PropsWithChildren,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import css from './toast.module.css'
import './toast.animations.css'
import flex from '@course/styles'
import cx from '@course/cx'

const TIMER = 3000

/**
 * API which is exposed to developer
 */
export type TToastMethods = {
  toast: (item: TToastItem) => void
}

type TToastItem = {
  id: string
  text: string
}

const ToastContext = createContext<TToastMethods>({
  toast: (_: TToastItem) => { },
})

/**
 * Renders the Toast component into target element and provides
 * API via React.ImperativeRef
 */
export function ToastProvider({ children, target }: PropsWithChildren<{ target: string }>) {
  const [targetElement, setTarget] = useState<HTMLElement | null>(null)

  const toastRef = useRef<TToastMethods>(null)

  useLayoutEffect(() => {
    if (targetElement == null && target != null) {
      const element = document.querySelector(target)
      if (element instanceof HTMLElement) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTarget(element)
      }
    }
  }, [target, targetElement])

  const context = useMemo(
    () => ({
      toast: (item: TToastItem) => toastRef.current?.toast(item),
    }),
    [],
  )

  return (
    <ToastContext.Provider value={context}>
      {targetElement && createPortal(<ToastList ref={toastRef} />, targetElement)}
      {children}
    </ToastContext.Provider>
  )
}

/**
 * Primary way on how to use Toast component
 */
export function useToast(): TToastMethods {
  const context = useContext(ToastContext)
  return context
}

function ToastList({ ref }: { ref: React.Ref<TToastMethods> }) {
  const [items, setItems] = useState<Array<TToastItem & { removed: boolean }>>([])

  useImperativeHandle(ref, () => ({
    toast: (item: TToastItem) => {
      setItems((items) => [...items, { ...item, removed: false }])
    },
  }))

  const onAnimationEnd: React.AnimationEventHandler<HTMLElement> = ({ target }) => {
    if (!(target instanceof HTMLElement)) {
      return
    }
    if (target.dataset.id == null) {
      return
    }
    if (target.dataset.removed === 'true') {
      setItems((items) => items.filter((it) => it.id !== target.dataset.id))
    } else if (target.dataset.removed === 'false') {
      setTimeout(() => {
        setItems((items) =>
          items.map((it) => ({
            ...it,
            removed: target.dataset.id === it.id ? true : it.removed,
          })),
        )
      }, TIMER)
    }
  }

  return (
    <ul
      data-test-example="react"
      aria-live="polite"
      aria-relevant="additions removals"
      className={cx(css['toast-list'], flex.flexColumnStart)}
      onAnimationEndCapture={onAnimationEnd}
    >
      {items.map((it) => (
        <li
          role="status"
          aria-atomic="true"
          aria-live="polite"
          key={it.id}
          data-removed={it.removed}
          data-id={it.id}
          className={`${it.removed ? css.fadeOut : css.fadeIn}`}
        >
          <div className={cx(css.toast, flex.flexColumnCenter)}>
            <p>{it.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
