export default function FinanceiroPage() {
  return (
    <iframe
      src="/financeiro/index.html"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        zIndex: 0,
      }}
      title="Financeiro"
    />
  )
}
