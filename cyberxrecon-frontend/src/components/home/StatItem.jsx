export default function StatItem({ value, label }) {
  return (
    <div className="px-6 py-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
      <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{value}</div>
      <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}
