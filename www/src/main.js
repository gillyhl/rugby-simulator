import init, { WasmPredictor } from '../pkg/rugby_simulator.js';

let predictor = null;

async function setup() {
  await init();
  predictor = new WasmPredictor();

  const btn = document.getElementById('predict-btn');
  btn.disabled = false;
  btn.textContent = 'Predict Match';
  btn.addEventListener('click', runPrediction);
}

function runPrediction() {
  if (!predictor) return;

  const homeTeam = document.getElementById('home-team').value.trim() || 'Home XV';
  const awayTeam = document.getElementById('away-team').value.trim() || 'Away XV';

  let result;
  try {
    result = JSON.parse(predictor.predict_game(homeTeam, awayTeam));
  } catch (err) {
    console.error('Prediction failed:', err);
    return;
  }

  renderResult(result);
}

function renderResult(data) {
  const { home, away } = data;

  document.getElementById('home-team-name').textContent = home.team;
  document.getElementById('away-team-name').textContent = away.team;
  document.getElementById('home-score').textContent = home.score;
  document.getElementById('away-score').textContent = away.score;

  renderStats('home-stats', home);
  renderStats('away-stats', away);

  const resultLabel = document.getElementById('result-label');
  if (home.score > away.score) {
    resultLabel.textContent = `${home.team} win`;
    resultLabel.className = 'result-label home-win';
  } else if (away.score > home.score) {
    resultLabel.textContent = `${away.team} win`;
    resultLabel.className = 'result-label away-win';
  } else {
    resultLabel.textContent = 'Draw';
    resultLabel.className = 'result-label draw';
  }

  document.getElementById('result').classList.remove('hidden');
}

function renderStats(elementId, teamData) {
  const el = document.getElementById(elementId);
  el.innerHTML = `
    <table class="stats-table">
      <tr><th colspan="2">${teamData.team}</th></tr>
      <tr><td>Tries</td><td>${teamData.tries}</td></tr>
      <tr><td>Conversions</td><td>${teamData.conversions}</td></tr>
      <tr><td>Penalties</td><td>${teamData.penalties}</td></tr>
      <tr><td>Drop Goals</td><td>${teamData.drop_goals}</td></tr>
    </table>
  `;
}

setup().catch(err => {
  const btn = document.getElementById('predict-btn');
  btn.textContent = 'Failed to load model';
  console.error('WASM init failed:', err);
});
