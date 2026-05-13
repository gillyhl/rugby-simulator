import { useState, useEffect } from 'react';

export default function MatchTimeline({ fixture, simulatedGame, onClose, onComplete }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [displayedEvents, setDisplayedEvents] = useState([]);

  const gameDurationSeconds = 80 * 60;
  const speedUpFactor = 1000; // 1 real-time millisecond = 1 game second

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const nextTime = prev + 1;
        return nextTime <= gameDurationSeconds ? nextTime : gameDurationSeconds;
      });
    }, speedUpFactor / 60);

    return () => clearInterval(interval);
  }, [isPlaying, gameDurationSeconds]);

  useEffect(() => {
    const events = simulatedGame.events.filter(
      e => e.timestamp_seconds <= currentTime
    );

    let newHomeScore = 0;
    let newAwayScore = 0;

    events.forEach(event => {
      const points = getEventPoints(event);
      if (event.team === 'home') {
        newHomeScore += points;
      } else {
        newAwayScore += points;
      }
    });

    setHomeScore(newHomeScore);
    setAwayScore(newAwayScore);
    setDisplayedEvents(events);
  }, [currentTime, simulatedGame.events]);

  const getEventPoints = (event) => {
    if (event.event_type === 'try') {
      return event.converted ? 7 : 5;
    }
    switch (event.event_type) {
      case 'penalty':
        return 3;
      case 'dropGoal':
        return 3;
      default:
        return 0;
    }
  };

  const getEventLabel = (event) => {
    if (event.event_type === 'try') {
      return event.converted ? 'TRY (CONVERTED)' : 'TRY';
    }
    switch (event.event_type) {
      case 'penalty':
        return 'Penalty';
      case 'dropGoal':
        return 'Drop Goal';
      default:
        return '';
    }
  };

  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  const progress = (currentTime / gameDurationSeconds) * 100;

  const isComplete = currentTime === gameDurationSeconds;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border-2 border-amber-400 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-amber-400/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-amber-400 mb-2">
              {fixture.home} vs {fixture.away}
            </h2>
            <p className="text-neutral-400 text-sm">
              Match Timeline - Watch the game unfold live
            </p>
          </div>
          <button
            onClick={() => {
              if (isComplete && onComplete) {
                onComplete(simulatedGame, fixture);
              }
              onClose();
            }}
            className="text-neutral-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Score Display */}
        <div className="bg-neutral-800/50 border-b border-amber-400/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 text-center">
              <p className="text-neutral-400 text-sm mb-1">{fixture.home}</p>
              <p className="text-4xl font-bold text-white">{homeScore}</p>
            </div>
            <div className="px-6 text-center">
              <p className="text-2xl font-bold text-amber-400">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
              <p className="text-xs text-neutral-400 mt-1">/ 80:00</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-neutral-400 text-sm mb-1">{fixture.away}</p>
              <p className="text-4xl font-bold text-white">{awayScore}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-neutral-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Events Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {displayedEvents.length === 0 ? (
            <div className="text-center text-neutral-500 py-8">
              Waiting for action...
            </div>
          ) : (
            displayedEvents.map((event, idx) => {
              const eventMinutes = Math.floor(event.timestamp_seconds / 60);
              const eventSeconds = event.timestamp_seconds % 60;
              const teamName = event.team === 'home' ? fixture.home : fixture.away;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border transition-all animate-in fade-in ${
                    event.team === 'home'
                      ? 'bg-linear-to-r from-blue-900/30 to-blue-900/10 border-blue-700/50 hover:border-blue-600'
                      : 'bg-linear-to-r from-red-900/30 to-red-900/10 border-red-700/50 hover:border-red-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-white font-bold">{teamName}</span>
                        <span className="text-neutral-400 text-sm">scores</span>
                        <span className="text-amber-400 font-semibold">
                          {getEventLabel(event)}
                        </span>
                      </div>
                    </div>
                    <span className={`text-sm font-bold shrink-0 px-2 py-1 rounded ${
                      event.team === 'home'
                        ? 'bg-blue-900/50 text-blue-200'
                        : 'bg-red-900/50 text-red-200'
                    }`}>
                      {eventMinutes}:{eventSeconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          {isComplete && (
            <div className="text-center mt-8 pt-8 border-t border-neutral-700">
              <p className="text-amber-400 font-bold text-lg mb-2">
                Full Time
              </p>
              <p className="text-2xl font-bold text-white">
                {fixture.home} {homeScore} - {awayScore} {fixture.away}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="border-t border-amber-400/30 bg-neutral-800/50 p-4 flex items-center justify-between gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded font-bold transition-colors ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          {!isComplete && (
            <button
              onClick={() => {
                setCurrentTime(gameDurationSeconds);
                setIsPlaying(false);
              }}
              className="px-4 py-2 bg-amber-400 text-neutral-950 rounded font-bold hover:bg-amber-500"
            >
              Skip to End
            </button>
          )}
          <div className="flex-1 text-center">
            <p className="text-neutral-400 text-sm">
              {isComplete ? 'Match Complete' : `${Math.round(progress)}% Complete`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
