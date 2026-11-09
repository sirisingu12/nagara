function Card({ children, className = '', ...props }) {
  return (
    <div
      {...props}
      className={`rounded-xl border border-border bg-surface p-5 ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
