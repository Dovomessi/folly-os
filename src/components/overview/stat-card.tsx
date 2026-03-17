interface StatCardProps {
  label: string
  value: number | string
  sub: string
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-[#161922] border border-[#2A2D37] rounded-xl p-5">
      <div className="text-xs text-[#8A8F98] mb-1.5">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-xs text-[#555A65] mt-1">{sub}</div>
    </div>
  )
}
