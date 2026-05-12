export default function Scoreboard({ home, away }) {
  const homeWin = home.score > away.score;
  const awayWin = away.score > home.score;
  const isDraw = home.score === away.score;

  let resultText = '';
  if (homeWin) resultText = `${home.team} win`;
  else if (awayWin) resultText = `${away.team} win`;
  else resultText = 'Draw';

  return (
    <>
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-neutral-400 text-sm mb-2">{home.team}</p>
          <p className="text-6xl font-bold text-amber-400">{home.score}</p>
        </div>
        <p className="text-2xl text-neutral-500">–</p>
        <div className="text-center">
          <p className="text-neutral-400 text-sm mb-2">{away.team}</p>
          <p className="text-6xl font-bold text-amber-400">{away.score}</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-bold uppercase tracking-widest text-amber-400">
          {resultText}
        </p>
      </div>
    </>
  );
}
