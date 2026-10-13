import { useEffect, useState } from 'react'
import { useGameState } from '../game/useGame.js'

function ToastMessage({ duration, message }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(false), duration)
    return () => window.clearTimeout(timer)
  }, [duration])

  return isVisible ? <div className="toast">{message}</div> : null
}

function Toast() {
  const { feedbackEvent } = useGameState()

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {feedbackEvent?.message && (
        <ToastMessage
          duration={feedbackEvent.duration}
          key={feedbackEvent.id}
          message={feedbackEvent.message}
        />
      )}
    </div>
  )
}

export default Toast
