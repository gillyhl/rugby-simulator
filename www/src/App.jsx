import { useState, useEffect } from 'react';
import init, { WasmPredictor } from '../pkg/rugby_simulator.js';
import TeamInput from './components/TeamInput';
import Scoreboard from './components/Scoreboard';
import StatsTable from './components/StatsTable';

export default function App() {
  const [predictor, setPredictor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homeTeam, setHomeTeam] = useState('Home XV');
  const [awayTeam, setAwayTeam] = useState('Away XV');
  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    async function setupWasm() {
      try {
        await init();
        setPredictor(new WasmPredictor());
        setLoading(false);
      } catch (err) {
        console.error('WASM init failed:', err);
        setError('Failed to load model');
        setLoading(false);
      }
    }
    setupWasm();
  }, []);

  const handlePredict = () => {
    if (!predictor) return;

    setPredicting(true);
    try {
      const home = homeTeam.trim() || 'Home XV';
      const away = awayTeam.trim() || 'Away XV';
      const resultJson = predictor.predict_game(home, away);
      const resultData = JSON.parse(resultJson);
      setResult(resultData);
    } catch (err) {
      console.error('Prediction failed:', err);
      setError('Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
            Rugby Match Predictor
          </h1>
          <p className="text-neutral-400">
            Powered by Poisson distribution statistical modelling
          </p>
        </header>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Main content */}
        <main className="space-y-6">
          {/* Team inputs */}
          <section className="flex flex-col md:flex-row items-end gap-4">
            <TeamInput
              label="Home Team"
              value={homeTeam}
              onChange={setHomeTeam}
              placeholder="e.g. All Blacks"
            />
            <div className="text-amber-400 font-bold text-lg md:mb-2">VS</div>
            <TeamInput
              label="Away Team"
              value={awayTeam}
              onChange={setAwayTeam}
              placeholder="e.g. Springboks"
            />
          </section>

          {/* Predict button */}
          <button
            onClick={handlePredict}
            disabled={loading || !predictor || predicting}
            className={`w-full py-3 px-4 rounded-lg font-bold text-lg uppercase tracking-wide transition-all ${
              loading || !predictor || predicting
                ? 'bg-amber-400/50 text-neutral-950 cursor-not-allowed opacity-50'
                : 'bg-amber-400 text-neutral-950 hover:bg-amber-500 active:scale-95'
            }`}
          >
            {loading ? 'Loading model...' : predicting ? 'Predicting...' : 'Predict Match'}
          </button>

          {/* Result */}
          {result && (
            <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 space-y-6">
              <Scoreboard home={result.home} away={result.away} />

              <div className="grid grid-cols-2 gap-4">
                <StatsTable team={result.home} />
                <StatsTable team={result.away} />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
