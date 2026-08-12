export default function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group relative border border-white/10 bg-black/50 backdrop-blur-md rounded-2xl p-6 hover:border-cyan-500/40 hover:bg-black/70 transition-all duration-300 text-left overflow-hidden shadow-lg shadow-black/50 hover:shadow-cyan-500/5">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      <div className="text-3xl mb-4 transform group-hover:scale-110 group-hover:translate-x-1 transition-transform duration-300 inline-block">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-200">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
