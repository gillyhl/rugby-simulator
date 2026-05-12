export default function StatsTable({ team }) {
  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-amber-400/30">
            <th colSpan="2" className="py-2 px-2 text-amber-400 font-bold uppercase text-xs text-center">
              {team.team}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-neutral-800">
            <td className="py-2 px-2 text-neutral-400">Tries</td>
            <td className="py-2 px-2 text-right font-bold text-white">{team.tries}</td>
          </tr>
          <tr className="border-b border-neutral-800">
            <td className="py-2 px-2 text-neutral-400">Conversions</td>
            <td className="py-2 px-2 text-right font-bold text-white">{team.conversions}</td>
          </tr>
          <tr className="border-b border-neutral-800">
            <td className="py-2 px-2 text-neutral-400">Penalties</td>
            <td className="py-2 px-2 text-right font-bold text-white">{team.penalties}</td>
          </tr>
          <tr>
            <td className="py-2 px-2 text-neutral-400">Drop Goals</td>
            <td className="py-2 px-2 text-right font-bold text-white">{team.drop_goals}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
