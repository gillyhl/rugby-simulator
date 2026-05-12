export default function PlayoffBracket({
  playoffFixtures,
  onSimulateMatch,
  simulating
}) {
  if (!playoffFixtures || playoffFixtures.length === 0) {
    return null;
  }

  const sf1 = playoffFixtures[0];
  const sf2 = playoffFixtures[1];
  const final = playoffFixtures[2];

  const sf1Complete = sf1?.result !== null;
  const sf2Complete = sf2?.result !== null;
  const finalReady = sf1Complete && sf2Complete;
  const finalComplete = final?.result !== null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-amber-400">Playoffs</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Semi-Final 1 */}
        <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-4">
          <h3 className="text-sm font-bold text-amber-400 mb-3 uppercase">
            {sf1.label}
          </h3>
          <div className="space-y-2">
            <div className="text-white font-bold">{sf1.home}</div>
            <div className="text-white font-bold">{sf1.away}</div>
          </div>

          {sf1.result ? (
            <div className="mt-3 pt-3 border-t border-neutral-700 text-center">
              <div className="text-sm text-neutral-400 mb-1">Result</div>
              <div className="flex justify-center gap-4">
                <div className="text-lg font-bold text-amber-400">
                  {sf1.result.homeScore}
                </div>
                <div className="text-lg font-bold text-amber-400">
                  {sf1.result.awayScore}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onSimulateMatch(sf1)}
              disabled={simulating}
              className="w-full mt-3 py-2 px-3 bg-amber-400 text-neutral-950 font-bold rounded text-sm hover:bg-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {simulating ? 'Simulating...' : 'Simulate'}
            </button>
          )}
        </div>

        {/* Semi-Final 2 */}
        <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-4">
          <h3 className="text-sm font-bold text-amber-400 mb-3 uppercase">
            {sf2.label}
          </h3>
          <div className="space-y-2">
            <div className="text-white font-bold">{sf2.home}</div>
            <div className="text-white font-bold">{sf2.away}</div>
          </div>

          {sf2.result ? (
            <div className="mt-3 pt-3 border-t border-neutral-700 text-center">
              <div className="text-sm text-neutral-400 mb-1">Result</div>
              <div className="flex justify-center gap-4">
                <div className="text-lg font-bold text-amber-400">
                  {sf2.result.homeScore}
                </div>
                <div className="text-lg font-bold text-amber-400">
                  {sf2.result.awayScore}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onSimulateMatch(sf2)}
              disabled={simulating}
              className="w-full mt-3 py-2 px-3 bg-amber-400 text-neutral-950 font-bold rounded text-sm hover:bg-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {simulating ? 'Simulating...' : 'Simulate'}
            </button>
          )}
        </div>

        {/* Final */}
        <div
          className={`bg-neutral-800/30 border rounded-lg p-4 ${
            finalReady ? 'border-amber-400' : 'border-neutral-700'
          }`}
        >
          <h3 className="text-sm font-bold text-amber-400 mb-3 uppercase">
            {final.label}
          </h3>

          {finalReady ? (
            <>
              <div className="space-y-2">
                <div className="text-white font-bold">{final.home}</div>
                <div className="text-white font-bold">{final.away}</div>
              </div>

              {finalComplete ? (
                <div className="mt-3 pt-3 border-t border-neutral-700 text-center">
                  <div className="text-sm text-neutral-400 mb-1">Winner</div>
                  <div className="text-lg font-bold text-amber-400">
                    {final.result.homeScore > final.result.awayScore
                      ? final.home
                      : final.result.awayScore > final.result.homeScore
                      ? final.away
                      : 'Draw'}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onSimulateMatch(final)}
                  disabled={simulating}
                  className="w-full mt-3 py-2 px-3 bg-amber-400 text-neutral-950 font-bold rounded text-sm hover:bg-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {simulating ? 'Simulating...' : 'Simulate'}
                </button>
              )}
            </>
          ) : (
            <div className="text-neutral-500 text-sm italic">
              Waiting for semi-finals to complete...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
