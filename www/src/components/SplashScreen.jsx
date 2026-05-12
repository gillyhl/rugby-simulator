export default function SplashScreen({ loading, onSingleMatch, onSeason }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <header className="text-center">
          <h1 className="text-5xl font-bold text-amber-400 mb-2">Rugby Simulator</h1>
          <p className="text-neutral-400">Powered by Poisson distribution statistical modelling</p>
        </header>

        <div className="space-y-4">
          <button
            onClick={onSingleMatch}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg uppercase tracking-wide transition-all ${
              loading
                ? 'bg-amber-400/50 text-neutral-950 cursor-not-allowed opacity-50'
                : 'bg-amber-400 text-neutral-950 hover:bg-amber-500 active:scale-95'
            }`}
          >
            {loading ? 'Loading model...' : 'Single Match'}
          </button>

          <button
            onClick={onSeason}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg uppercase tracking-wide transition-all ${
              loading
                ? 'bg-amber-400/50 text-neutral-950 cursor-not-allowed opacity-50'
                : 'bg-amber-400 text-neutral-950 hover:bg-amber-500 active:scale-95'
            }`}
          >
            {loading ? 'Loading model...' : 'Gallagher Premiership Season'}
          </button>
        </div>
      </div>
    </div>
  );
}
