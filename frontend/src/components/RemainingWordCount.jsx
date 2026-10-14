import { useEffect, useRef, useState } from 'react'

const ANIMATION_DURATION = 1000
const NUMBER_FORMATTER = new Intl.NumberFormat('en-US')

function RemainingWordCount({ value }) {
  const [displayValue, setDisplayValue] = useState(value)
  const displayedValue = useRef(value)

  useEffect(() => {
    const startValue = displayedValue.current
    if (startValue === value) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startedAt = window.performance.now()
    let animationFrame

    const updateValue = (timestamp) => {
      const progress = reduceMotion ? 1 : Math.min((timestamp - startedAt) / ANIMATION_DURATION, 1)
      const easedProgress = 1 - (1 - progress) ** 3
      const nextValue = Math.round(startValue + (value - startValue) * easedProgress)

      displayedValue.current = nextValue
      setDisplayValue(nextValue)

      if (progress < 1) animationFrame = window.requestAnimationFrame(updateValue)
    }

    animationFrame = window.requestAnimationFrame(updateValue)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [value])

  return (
    <div className="remaining-word-count">
      <span aria-hidden="true">{NUMBER_FORMATTER.format(displayValue)} possible words left</span>
      <span className="visually-hidden" aria-live="polite">
        {NUMBER_FORMATTER.format(value)} possible {value === 1 ? 'word' : 'words'} remaining
      </span>
    </div>
  )
}

export default RemainingWordCount
