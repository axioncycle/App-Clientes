import Link from 'next/link'
import CustomerForm from '@/components/CustomerForm'

export const metadata = {
  title: 'Novo Cliente - Bike Shop',
}

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/customers" className="hover:text-white transition-colors">
          Clientes
        </Link>
        <span>/</span>
        <span className="text-white">Novo Cliente</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-white">Novo Cliente</h1>
        <p className="text-slate-400 text-sm mt-1">Preencha os dados do novo cliente</p>
      </div>

      <CustomerForm mode="create" />
    </div>
  )
}
