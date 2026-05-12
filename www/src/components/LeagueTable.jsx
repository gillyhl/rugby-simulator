export default function LeagueTable({ rows, top4Teams }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-amber-400/10 border-b border-neutral-800">
              <th className="px-4 py-3 text-left text-amber-400 font-bold">Team</th>
              <th className="px-2 py-3 text-center text-amber-400 font-bold">P</th>
              <th className="px-2 py-3 text-center text-amber-400 font-bold">W</th>
              <th className="px-2 py-3 text-center text-amber-400 font-bold">D</th>
              <th className="px-2 py-3 text-center text-amber-400 font-bold">L</th>
              <th className="px-2 py-3 text-center text-amber-400 font-bold">PF</th>
              <th className="px-2 py-3 text-center text-amber-400 font-bold">PA</th>
              <th className="px-2 py-3 text-center text-amber-400 font-bold">TB</th>
              <th className="px-2 py-3 text-center text-amber-400 font-bold">LB</th>
              <th className="px-3 py-3 text-right text-amber-400 font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isPlayoffQualifier = idx < 4;
              return (
                <tr
                  key={row.team}
                  className={`border-b border-neutral-800 ${
                    isPlayoffQualifier ? 'bg-amber-400/5' : ''
                  }`}
                >
                  <td
                    className={`px-4 py-3 ${
                      isPlayoffQualifier ? 'text-amber-400 font-bold' : 'text-white'
                    }`}
                  >
                    {row.team}
                  </td>
                  <td className="px-2 py-3 text-center text-neutral-400">{row.played}</td>
                  <td className="px-2 py-3 text-center text-neutral-400">{row.won}</td>
                  <td className="px-2 py-3 text-center text-neutral-400">{row.drawn}</td>
                  <td className="px-2 py-3 text-center text-neutral-400">{row.lost}</td>
                  <td className="px-2 py-3 text-center text-neutral-400">{row.pointsFor}</td>
                  <td className="px-2 py-3 text-center text-neutral-400">{row.pointsAgainst}</td>
                  <td className="px-2 py-3 text-center text-neutral-400">{row.tryBonus}</td>
                  <td className="px-2 py-3 text-center text-neutral-400">{row.losingBonus}</td>
                  <td className="px-3 py-3 text-right font-bold text-white">
                    {row.totalPoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
