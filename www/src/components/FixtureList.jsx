export default function FixtureList({
  fixtures,
  currentRound,
  onSimulateMatch,
  onSimulateRound,
  simulating
}) {
  const roundedFixtures = {};
  for (const fixture of fixtures) {
    if (!roundedFixtures[fixture.round]) {
      roundedFixtures[fixture.round] = [];
    }
    roundedFixtures[fixture.round].push(fixture);
  }

  const rounds = Object.keys(roundedFixtures)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {rounds.map(round => {
        const roundFixtures = roundedFixtures[round];
        const isCurrent = round === currentRound;
        const isCompleted = roundFixtures.every(f => f.result !== null);

        return (
          <div
            key={round}
            className={`border rounded-lg p-4 ${
              isCurrent
                ? 'border-amber-400 bg-neutral-900'
                : isCompleted
                ? 'border-neutral-700 bg-neutral-900/50'
                : 'border-neutral-800 bg-neutral-900'
            } ${!isCurrent && !isCompleted ? 'opacity-40' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${
                isCurrent ? 'text-amber-400' : 'text-neutral-400'
              }`}>
                Round {round}
              </h3>
              {isCurrent && (
                <button
                  onClick={() => onSimulateRound(round)}
                  disabled={isCompleted || simulating}
                  className="py-1.5 px-3 bg-amber-400 text-neutral-950 font-bold rounded text-sm hover:bg-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {simulating ? 'Simulating...' : 'Simulate Round'}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {roundFixtures.map(fixture => (
                <div
                  key={fixture.id}
                  className="flex items-center justify-between bg-neutral-800/40 p-3 rounded"
                >
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">
                      {fixture.home}
                    </div>
                    <div className="text-sm font-bold text-white">
                      {fixture.away}
                    </div>
                  </div>

                  {fixture.result ? (
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-amber-400">
                        {fixture.result.homeScore}
                      </div>
                      <div className="text-xs text-neutral-400 mb-1">–</div>
                      <div className="text-lg font-bold text-amber-400">
                        {fixture.result.awayScore}
                      </div>
                    </div>
                  ) : isCurrent ? (
                    <button
                      onClick={() => onSimulateMatch(fixture)}
                      disabled={simulating}
                      className="ml-4 py-1 px-2.5 bg-amber-400 text-neutral-950 font-bold rounded text-xs hover:bg-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {simulating ? 'Sim...' : 'Simulate'}
                    </button>
                  ) : (
                    <div className="ml-4 text-neutral-500 text-sm font-bold">–</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
