function Toast({ message }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {message && <div className="toast">{message}</div>}
    </div>
  )
}

export default Toast
