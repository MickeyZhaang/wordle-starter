import { useEffect, useState } from 'react'

function ToastMessage({ duration, message }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(false), duration)
    return () => window.clearTimeout(timer)
  }, [duration])

  return isVisible ? <div className="toast">{message}</div> : null
}

function Toast({ event }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {event?.message && (
        <ToastMessage duration={event.duration} key={event.id} message={event.message} />
      )}
    </div>
  )
}

export default Toast
