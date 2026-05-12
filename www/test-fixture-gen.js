const TEAMS = [
  "Bath", "Bristol Bears", "Exeter Chiefs", "Gloucester",
  "Harlequins", "Leicester Tigers", "Northampton Saints",
  "Sale Sharks", "Saracens", "Newcastle Falcons"
];

function generateFixtures() {
  const teams = [...TEAMS];
  const fixtures = [];
  let id = 0;
  for (let round = 1; round <= 9; round++) {
    for (let i = 0; i < 5; i++) {
      const [h, a] = round % 2 === 1
        ? [teams[i], teams[9 - i]]
        : [teams[9 - i], teams[i]];
      fixtures.push({ id: id++, round, home: h, away: a, result: null });
    }
    const last = teams.splice(9, 1)[0];
    teams.splice(1, 0, last);
  }
  for (const f of fixtures.slice(0, 45)) {
    fixtures.push({ id: id++, round: f.round + 9, home: f.away, away: f.home, result: null });
  }
  return fixtures;
}

const fixtures = generateFixtures();
const round1 = fixtures.filter(f => f.round === 1);
console.log('Round 1 fixtures:');
round1.forEach(f => {
  console.log(`  ${f.id}: ${f.home} vs ${f.away}`);
  console.log(`    home type: ${typeof f.home}, away type: ${typeof f.away}`);
});
