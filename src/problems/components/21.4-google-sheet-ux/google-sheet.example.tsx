import { GoogleSheet } from './google-sheet.react'
import { GoogleSheet as VanillaGoogleSheet } from './google-sheet.vanila'
import { useRef, useEffect } from 'react'

export const GoogleSheetExample = () => {
  return <GoogleSheet />
}

export const GoogleSheetVanillaExample = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    // Create vanilla instance
    const component = new VanillaGoogleSheet({
      root: ref.current,
    })

    component.render()

    return () => {
      component.destroy()
    }
  }, [])

  return <div ref={ref} />
}
