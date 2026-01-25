import { GPTComponent } from './gpt-chat.react'
import { GPTChat } from './gpt-chat.vanila'
import { useEffect, useRef } from 'react'

export const GPTComponentExample = () => <GPTComponent />

export const GPTChatVanillaExample = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<GPTChat | null>(null)

  useEffect(() => {
    if (!rootRef.current) return
    instanceRef.current = new GPTChat({ root: rootRef.current })
    instanceRef.current.render()

    return () => {
      instanceRef.current?.destroy()
      instanceRef.current = null
    }
  }, [])

  return <div ref={rootRef} />
}
