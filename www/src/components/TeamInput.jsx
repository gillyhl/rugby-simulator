export default function TeamInput({ label, value, onChange, placeholder }) {
  return (
    <div className="flex-1">
      <label className="block text-amber-400 text-sm font-bold uppercase tracking-wider mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-neutral-900 border border-amber-400/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
      />
    </div>
  );
}
