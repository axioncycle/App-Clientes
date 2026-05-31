export default function FinanceiroPage() {
  return (
    <>
      <style>{`
        body { margin: 0; overflow: hidden; }
        iframe { position: fixed; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: 0; }
      `}</style>
      <iframe
        src="/financeiro-app"
        title="Financeiro"
        allow="clipboard-read; clipboard-write"
      />
    </>
  )
}
