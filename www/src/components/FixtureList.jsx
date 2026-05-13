import { useState } from 'react';
import { getTeamLogo, getTeamLogoStyle } from '../utils/teamsData';
import { calcLeaguePoints } from '../utils/seasonUtils';
import MatchTimeline from './MatchTimeline';

export default function FixtureList({
  fixtures,
  currentRound,
  onSimulateMatch,
  onSimulateRound,
  simulating,
  onWatchMatch,
  onFixtureUpdate
}) {
  const [expandedFixtures, setExpandedFixtures] = useState(new Set());
  const [watchingFixture, setWatchingFixture] = useState(null);
  const [simulatedGame, setSimulatedGame] = useState(null);

  const toggleExpanded = (fixtureId) => {
    setExpandedFixtures(prev => {
      const next = new Set(prev);
      if (next.has(fixtureId)) {
        next.delete(fixtureId);
      } else {
        next.add(fixtureId);
      }
      return next;
    });
  };

  const handleWatchMatch = async (fixture) => {
    if (onWatchMatch) {
      const game = await onWatchMatch(fixture);
      setWatchingFixture(fixture);
      setSimulatedGame(game);
    }
  };

  const handleTimelineComplete = (simulatedGame, fixture) => {
    if (simulatedGame && onFixtureUpdate) {
      const { homePoints, awayPoints } = calcLeaguePoints(
        simulatedGame.home.score,
        simulatedGame.away.score,
        simulatedGame.home.tries,
        simulatedGame.away.tries
      );

      const matchResult = {
        homeScore: simulatedGame.home.score,
        awayScore: simulatedGame.away.score,
        homeTries: simulatedGame.home.tries,
        awayTries: simulatedGame.away.tries,
        homeConversions: simulatedGame.home.conversions,
        awayConversions: simulatedGame.away.conversions,
        homePenalties: simulatedGame.home.penalties,
        awayPenalties: simulatedGame.away.penalties,
        homeDropGoals: simulatedGame.home.drop_goals,
        awayDropGoals: simulatedGame.away.drop_goals,
        homePoints,
        awayPoints
      };

      onFixtureUpdate(fixture.id, matchResult);
    }
  };
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
              {roundFixtures.map(fixture => {
                const isExpanded = expandedFixtures.has(fixture.id);
                return (
                  <div key={fixture.id}>
                    <button
                      onClick={() => fixture.result && toggleExpanded(fixture.id)}
                      className={`w-full relative flex items-center justify-between bg-neutral-800/40 p-3 rounded ${
                        fixture.result ? 'cursor-pointer hover:bg-neutral-800/60 transition-colors' : ''
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-25 overflow-hidden">
                        <img
                          src={getTeamLogo(fixture.home)}
                          alt={fixture.home}
                          className="absolute -translate-x-1/2 -translate-y-1/2 -rotate-12"
                          style={{ width: '120px', maxWidth: 'none', objectFit: 'contain', top: '50%', left: '50%', ...getTeamLogoStyle(fixture.home) }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                      <div className="absolute right-0 top-0 bottom-0 w-25 overflow-hidden">
                        <img
                          src={getTeamLogo(fixture.away)}
                          alt={fixture.away}
                          className="absolute -translate-x-1/2 -translate-y-1/2 rotate-12"
                          style={{ width: '120px', maxWidth: 'none', objectFit: 'contain', top: '50%', left: '50%', ...getTeamLogoStyle(fixture.away) }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>

                      <div className="flex items-center flex-1 gap-3 relative z-10">
                        {fixture.result && (
                          <span className={`text-neutral-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`}>
                            ▶
                          </span>
                        )}
                        {!fixture.result && (
                          <span className="w-4 shrink-0"></span>
                        )}

                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <div className="text-white font-bold text-right min-w-28">
                            {fixture.home}
                          </div>
                        </div>

                        {fixture.result ? (
                          <div className="flex items-center gap-2 text-amber-400 font-bold w-auto justify-center shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWatchMatch(fixture);
                              }}
                              className="py-1 px-2 bg-blue-600 text-white font-bold rounded text-xs hover:bg-blue-700 active:scale-95 transition-all"
                              title="Watch the match timeline"
                            >
                              Watch
                            </button>
                            <span>{fixture.result.homeScore}</span>
                            <span className="text-neutral-400">v</span>
                            <span>{fixture.result.awayScore}</span>
                          </div>
                        ) : isCurrent ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSimulateMatch(fixture);
                              }}
                              disabled={simulating}
                              className="py-1 px-2.5 bg-amber-400 text-neutral-950 font-bold rounded text-xs hover:bg-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              title="Simulate and show result immediately"
                            >
                              {simulating ? 'Sim...' : 'Simulate'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWatchMatch(fixture);
                              }}
                              disabled={simulating}
                              className="py-1 px-2.5 bg-blue-600 text-white font-bold rounded text-xs hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              title="Watch the match unfold live"
                            >
                              Watch
                            </button>
                          </div>
                        ) : (
                          <div className="text-neutral-500 w-20 text-center shrink-0">– v –</div>
                        )}

                        <div className="flex items-center gap-2 flex-1">
                          <div className="text-white font-bold text-left min-w-28">
                            {fixture.away}
                          </div>
                        </div>
                      </div>
                    </button>

                    {fixture.result && isExpanded && (
                      <div className="bg-neutral-800/20 p-4 rounded-b border-t border-neutral-800">
                        <div className="grid grid-cols-2 gap-6">
                          {/* Home Team Stats */}
                          <div>
                            <h4 className="text-white font-bold mb-3 text-center">{fixture.home}</h4>
                            <div className="space-y-2 text-sm text-neutral-300">
                              <div className="flex justify-between">
                                <span>Tries</span>
                                <span className="text-white font-bold">{fixture.result.homeTries}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Conversions</span>
                                <span className="text-white font-bold">{fixture.result.homeConversions}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Penalties</span>
                                <span className="text-white font-bold">{fixture.result.homePenalties}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Drop Goals</span>
                                <span className="text-white font-bold">{fixture.result.homeDropGoals}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-neutral-700">
                                <span className="font-bold">League Points</span>
                                <span className="text-amber-400 font-bold">{fixture.result.homePoints}</span>
                              </div>
                            </div>
                          </div>

                          {/* Away Team Stats */}
                          <div>
                            <h4 className="text-white font-bold mb-3 text-center">{fixture.away}</h4>
                            <div className="space-y-2 text-sm text-neutral-300">
                              <div className="flex justify-between">
                                <span>Tries</span>
                                <span className="text-white font-bold">{fixture.result.awayTries}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Conversions</span>
                                <span className="text-white font-bold">{fixture.result.awayConversions}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Penalties</span>
                                <span className="text-white font-bold">{fixture.result.awayPenalties}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Drop Goals</span>
                                <span className="text-white font-bold">{fixture.result.awayDropGoals}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-neutral-700">
                                <span className="font-bold">League Points</span>
                                <span className="text-amber-400 font-bold">{fixture.result.awayPoints}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {watchingFixture && simulatedGame && (
        <MatchTimeline
          fixture={watchingFixture}
          simulatedGame={simulatedGame}
          onClose={() => {
            setWatchingFixture(null);
            setSimulatedGame(null);
          }}
          onComplete={handleTimelineComplete}
        />
      )}
    </div>
  );
}
