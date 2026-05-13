import { useState, useMemo } from 'react';
import {
  generateFixtures,
  calcLeaguePoints,
  computeTable
} from '../utils/seasonUtils';
import LeagueTable from './LeagueTable';
import FixtureList from './FixtureList';
import PlayoffBracket from './PlayoffBracket';
import MatchTimeline from './MatchTimeline';

export default function SeasonMode({ predictor, createNewPredictor, onBack }) {
  const [fixtures, setFixtures] = useState(() => generateFixtures());
  const [phase, setPhase] = useState('season'); // 'season' | 'playoffs' | 'complete'
  const [playoffFixtures, setPlayoffFixtures] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [watchingPlayoffFixture, setWatchingPlayoffFixture] = useState(null);
  const [simulatedPlayoffGame, setSimulatedPlayoffGame] = useState(null);

  const currentRound = useMemo(() => {
    const unplayedRounds = fixtures
      .filter(f => f.result === null)
      .map(f => f.round);
    return unplayedRounds.length > 0 ? Math.min(...unplayedRounds) : 18;
  }, [fixtures]);

  const table = useMemo(() => computeTable(fixtures), [fixtures]);

  const seasonComplete = useMemo(() => {
    return fixtures.every(f => f.result !== null);
  }, [fixtures]);

  const simulateMatch = async (fixture) => {
    if (!predictor) return;

    setSimulating(true);
    try {
      console.log(`Simulating match: ${fixture.home} vs ${fixture.away}`);
      // Create a fresh predictor instance to avoid WASM RNG state corruption
      const freshPredictor = createNewPredictor();
      const resultJson = freshPredictor.predict_game(fixture.home, fixture.away);
      console.log('Result from WASM:', resultJson);
      const result = JSON.parse(resultJson);

      const { homePoints, awayPoints } = calcLeaguePoints(
        result.home.score,
        result.away.score,
        result.home.tries,
        result.away.tries
      );

      const matchResult = {
        homeScore: result.home.score,
        awayScore: result.away.score,
        homeTries: result.home.tries,
        awayTries: result.away.tries,
        homeConversions: result.home.conversions,
        awayConversions: result.away.conversions,
        homePenalties: result.home.penalties,
        awayPenalties: result.away.penalties,
        homeDropGoals: result.home.drop_goals,
        awayDropGoals: result.away.drop_goals,
        homePoints,
        awayPoints
      };

      setFixtures(prev =>
        prev.map(f => (f.id === fixture.id ? { ...f, result: matchResult } : f))
      );
      setError(null);
    } catch (err) {
      console.error('Simulation failed:', err);
      console.error('Error details:', {
        message: err.message,
        toString: err.toString(),
        type: err.constructor.name
      });
      setError(`Match simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const watchMatch = async (fixture) => {
    if (!predictor) return null;

    try {
      console.log(`Watching match: ${fixture.home} vs ${fixture.away}`);
      const freshPredictor = createNewPredictor();
      const resultJson = freshPredictor.simulate_game(fixture.home, fixture.away);
      console.log('Simulated game from WASM:', resultJson);
      const result = JSON.parse(resultJson);
      return result;
    } catch (err) {
      console.error('Timeline simulation failed:', err);
      setError(`Timeline simulation failed: ${err.message}`);
      return null;
    }
  };

  const updateFixtureResult = (fixtureId, matchResult) => {
    setFixtures(prev =>
      prev.map(f => (f.id === fixtureId ? { ...f, result: matchResult } : f))
    );
  };

  const simulateRound = async (round) => {
    if (!predictor) return;

    setSimulating(true);
    try {
      const roundFixtures = fixtures.filter(
        f => f.round === round && f.result === null
      );

      let updatedFixtures = [...fixtures];
      // Create a fresh predictor instance for this round to avoid WASM RNG state corruption
      const freshPredictor = createNewPredictor();

      for (const fixture of roundFixtures) {
        console.log(`Simulating match: ${fixture.home} vs ${fixture.away}`);
        let resultJson;
        try {
          resultJson = freshPredictor.predict_game(fixture.home, fixture.away);
          console.log('Result from WASM:', resultJson);
        } catch (err) {
          console.error('WASM predict_game failed:', err);
          throw err;
        }
        const result = JSON.parse(resultJson);

        const { homePoints, awayPoints } = calcLeaguePoints(
          result.home.score,
          result.away.score,
          result.home.tries,
          result.away.tries
        );

        const matchResult = {
          homeScore: result.home.score,
          awayScore: result.away.score,
          homeTries: result.home.tries,
          awayTries: result.away.tries,
          homeConversions: result.home.conversions,
          awayConversions: result.away.conversions,
          homePenalties: result.home.penalties,
          awayPenalties: result.away.penalties,
          homeDropGoals: result.home.drop_goals,
          awayDropGoals: result.away.drop_goals,
          homePoints,
          awayPoints
        };

        updatedFixtures = updatedFixtures.map(f =>
          f.id === fixture.id ? { ...f, result: matchResult } : f
        );
      }

      setFixtures(updatedFixtures);
      setError(null);
    } catch (err) {
      console.error('Round simulation failed:', err);
      console.error('Error details:', {
        message: err.message,
        toString: err.toString(),
        type: err.constructor.name
      });
      setError(`Round simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  // Bootstrap playoffs when season is complete
  useMemo(() => {
    if (seasonComplete && phase === 'season') {
      const top4 = table.slice(0, 4);
      setPlayoffFixtures([
        {
          id: 'sf1',
          label: 'Semi-Final 1',
          home: top4[0].team,
          away: top4[3].team,
          result: null
        },
        {
          id: 'sf2',
          label: 'Semi-Final 2',
          home: top4[1].team,
          away: top4[2].team,
          result: null
        },
        {
          id: 'final',
          label: 'Grand Final',
          home: null,
          away: null,
          result: null
        }
      ]);
      setPhase('playoffs');
    }
  }, [seasonComplete, phase, table]);

  // Populate final after both semi-finals are done
  useMemo(() => {
    if (phase === 'playoffs' && playoffFixtures.length === 3) {
      const sf1 = playoffFixtures[0];
      const sf2 = playoffFixtures[1];
      const final = playoffFixtures[2];

      if (
        sf1.result &&
        sf2.result &&
        !final.home &&
        !final.away
      ) {
        const sf1Winner =
          sf1.result.homeScore > sf1.result.awayScore ? sf1.home : sf1.away;
        const sf2Winner =
          sf2.result.homeScore > sf2.result.awayScore ? sf2.home : sf2.away;

        setPlayoffFixtures(prev =>
          prev.map(f =>
            f.id === 'final'
              ? { ...f, home: sf1Winner, away: sf2Winner }
              : f
          )
        );
      }

      if (final.result) {
        setPhase('complete');
      }
    }
  }, [phase, playoffFixtures]);

  const simulatePlayoffMatch = async (match) => {
    if (!predictor || !match.home || !match.away) return;

    setSimulating(true);
    try {
      // Create a fresh predictor instance to avoid WASM RNG state corruption
      const freshPredictor = createNewPredictor();
      const resultJson = freshPredictor.predict_game(match.home, match.away);
      const result = JSON.parse(resultJson);

      const { homePoints, awayPoints } = calcLeaguePoints(
        result.home.score,
        result.away.score,
        result.home.tries,
        result.away.tries
      );

      const matchResult = {
        homeScore: result.home.score,
        awayScore: result.away.score,
        homeTries: result.home.tries,
        awayTries: result.away.tries,
        homeConversions: result.home.conversions,
        awayConversions: result.away.conversions,
        homePenalties: result.home.penalties,
        awayPenalties: result.away.penalties,
        homeDropGoals: result.home.drop_goals,
        awayDropGoals: result.away.drop_goals,
        homePoints,
        awayPoints
      };

      setPlayoffFixtures(prev =>
        prev.map(f => (f.id === match.id ? { ...f, result: matchResult } : f))
      );
      setError(null);
    } catch (err) {
      console.error('Playoff simulation failed:', err);
      setError('Playoff simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const watchPlayoffMatch = async (match) => {
    if (!predictor || !match.home || !match.away) return null;

    try {
      console.log(`Watching playoff match: ${match.home} vs ${match.away}`);
      const freshPredictor = createNewPredictor();
      const resultJson = freshPredictor.simulate_game(match.home, match.away);
      console.log('Simulated playoff game from WASM:', resultJson);
      const result = JSON.parse(resultJson);
      return result;
    } catch (err) {
      console.error('Playoff timeline simulation failed:', err);
      setError(`Timeline simulation failed: ${err.message}`);
      return null;
    }
  };

  const handleWatchPlayoffMatch = async (match) => {
    const game = await watchPlayoffMatch(match);
    setWatchingPlayoffFixture(match);
    setSimulatedPlayoffGame(game);
  };

  const handlePlayoffTimelineComplete = (simulatedGame, fixture) => {
    if (simulatedGame) {
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

      setPlayoffFixtures(prev =>
        prev.map(f => (f.id === fixture.id ? { ...f, result: matchResult } : f))
      );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400">
              Gallagher Premiership
            </h1>
            <p className="text-neutral-400 mt-1">
              {phase === 'season' && `Round ${currentRound} of 18`}
              {phase === 'playoffs' && 'Playoffs'}
              {phase === 'complete' && 'Season Complete'}
            </p>
          </div>
          <button
            onClick={onBack}
            className="py-2 px-4 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-amber-400 transition-colors"
          >
            ← Back
          </button>
        </header>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {phase === 'season' && (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="sticky top-0 h-fit">
                <LeagueTable rows={table} />
              </div>
            </div>
            <div className="lg:col-span-3">
              <FixtureList
                fixtures={fixtures}
                currentRound={currentRound}
                onSimulateMatch={simulateMatch}
                onSimulateRound={simulateRound}
                onWatchMatch={watchMatch}
                onFixtureUpdate={updateFixtureResult}
                simulating={simulating}
              />
            </div>
          </div>
        )}

        {phase === 'playoffs' && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <div className="sticky top-0 h-fit">
                  <LeagueTable rows={table} />
                </div>
              </div>
              <div className="lg:col-span-3">
                <PlayoffBracket
                  playoffFixtures={playoffFixtures}
                  onSimulateMatch={simulatePlayoffMatch}
                  onWatchMatch={handleWatchPlayoffMatch}
                  simulating={simulating}
                />
              </div>
            </div>
            {watchingPlayoffFixture && simulatedPlayoffGame && (
              <MatchTimeline
                fixture={watchingPlayoffFixture}
                simulatedGame={simulatedPlayoffGame}
                onClose={() => {
                  setWatchingPlayoffFixture(null);
                  setSimulatedPlayoffGame(null);
                }}
                onComplete={handlePlayoffTimelineComplete}
              />
            )}
          </div>
        )}

        {phase === 'complete' && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <div className="sticky top-0 h-fit">
                  <LeagueTable rows={table} />
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="bg-neutral-900 border border-amber-400 rounded-lg p-8 text-center mb-8">
                  <h2 className="text-3xl font-bold text-amber-400 mb-4">
                    Season Complete!
                  </h2>
                  <p className="text-xl font-bold text-white mb-8">
                    {playoffFixtures[2].result.homeScore >
                    playoffFixtures[2].result.awayScore
                      ? playoffFixtures[2].home
                      : playoffFixtures[2].away}{' '}
                    are the Gallagher Premiership Champions!
                  </p>
                </div>
                <PlayoffBracket
                  playoffFixtures={playoffFixtures}
                  onWatchMatch={handleWatchPlayoffMatch}
                  simulating={simulating}
                />
              </div>
            </div>
            {watchingPlayoffFixture && simulatedPlayoffGame && (
              <MatchTimeline
                fixture={watchingPlayoffFixture}
                simulatedGame={simulatedPlayoffGame}
                onClose={() => {
                  setWatchingPlayoffFixture(null);
                  setSimulatedPlayoffGame(null);
                }}
                onComplete={handlePlayoffTimelineComplete}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
