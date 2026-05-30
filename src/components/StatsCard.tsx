interface StatsCardProps {
  title: string
  value: number | string
  icon: string
  color: 'blue' | 'amber' | 'green' | 'purple' | 'red'
  subtitle?: string
}

const colorMap = {
  blue: {
    bg: 'bg-blue-900/30',
    border: 'border-blue-700/50',
    icon: 'bg-blue-800/50 text-blue-300',
    value: 'text-blue-300',
  },
  amber: {
    bg: 'bg-amber-900/30',
    border: 'border-amber-700/50',
    icon: 'bg-amber-800/50 text-amber-300',
    value: 'text-amber-300',
  },
  green: {
    bg: 'bg-green-900/30',
    border: 'border-green-700/50',
    icon: 'bg-green-800/50 text-green-300',
    value: 'text-green-300',
  },
  purple: {
    bg: 'bg-purple-900/30',
    border: 'border-purple-700/50',
    icon: 'bg-purple-800/50 text-purple-300',
    value: 'text-purple-300',
  },
  red: {
    bg: 'bg-red-900/30',
    border: 'border-red-700/50',
    icon: 'bg-red-800/50 text-red-300',
    value: 'text-red-300',
  },
}

export default function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  const colors = colorMap[color]

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-5 flex items-center gap-4`}>
      <div className={`${colors.icon} rounded-xl p-3 text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className={`${colors.value} text-3xl font-bold`}>{value}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
