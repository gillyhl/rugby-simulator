export const TEAMS = [
  "Bath",
  "Bristol Bears",
  "Exeter Chiefs",
  "Gloucester",
  "Harlequins",
  "Leicester Tigers",
  "Northampton Saints",
  "Sale Sharks",
  "Saracens",
  "Newcastle Falcons"
];

export function generateFixtures() {
  const teams = [...TEAMS];
  const fixtures = [];
  let id = 0;

  // First half: 9 rounds
  for (let round = 1; round <= 9; round++) {
    for (let i = 0; i < 5; i++) {
      const [h, a] = round % 2 === 1
        ? [teams[i], teams[9 - i]]
        : [teams[9 - i], teams[i]];
      fixtures.push({ id: id++, round, home: h, away: a, result: null });
    }
    // Rotate teams[1..9], keep teams[0] fixed
    const last = teams.splice(9, 1)[0];
    teams.splice(1, 0, last);
  }

  // Second half: 9 rounds with home/away swapped
  for (const f of fixtures.slice(0, 45)) {
    fixtures.push({
      id: id++,
      round: f.round + 9,
      home: f.away,
      away: f.home,
      result: null
    });
  }

  return fixtures;
}

export function calcLeaguePoints(homeScore, awayScore, homeTries, awayTries) {
  const diff = homeScore - awayScore;
  let homePoints = 0;
  let awayPoints = 0;

  // Win/draw points
  if (diff > 0) {
    homePoints = 4;
  } else if (diff < 0) {
    awayPoints = 4;
  } else {
    homePoints = 2;
    awayPoints = 2;
  }

  // Losing bonus (lose by 7 or fewer)
  if (diff < 0 && Math.abs(diff) <= 7) {
    homePoints += 1;
  }
  if (diff > 0 && Math.abs(diff) <= 7) {
    awayPoints += 1;
  }

  // Try bonus (4+ tries)
  if (homeTries >= 4) {
    homePoints += 1;
  }
  if (awayTries >= 4) {
    awayPoints += 1;
  }

  return { homePoints, awayPoints };
}

export function computeTable(fixtures) {
  const rows = Object.fromEntries(
    TEAMS.map(team => [
      team,
      {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        tryBonus: 0,
        losingBonus: 0,
        totalPoints: 0
      }
    ])
  );

  for (const fixture of fixtures) {
    if (!fixture.result) continue;

    const h = rows[fixture.home];
    const a = rows[fixture.away];
    const { homeScore, awayScore, homeTries, awayTries } = fixture.result;

    h.played++;
    a.played++;
    h.pointsFor += homeScore;
    a.pointsFor += awayScore;
    h.pointsAgainst += awayScore;
    a.pointsAgainst += homeScore;

    const diff = homeScore - awayScore;
    if (diff > 0) {
      h.won++;
      a.lost++;
    } else if (diff < 0) {
      a.won++;
      h.lost++;
    } else {
      h.drawn++;
      a.drawn++;
    }

    // Try bonuses
    if (homeTries >= 4) {
      h.tryBonus++;
    }
    if (awayTries >= 4) {
      a.tryBonus++;
    }

    // Losing bonuses
    if (diff < 0 && Math.abs(diff) <= 7) {
      h.losingBonus++;
    }
    if (diff > 0 && Math.abs(diff) <= 7) {
      a.losingBonus++;
    }

    // Recalc total points
    h.totalPoints = 4 * h.won + 2 * h.drawn + h.tryBonus + h.losingBonus;
    a.totalPoints = 4 * a.won + 2 * a.drawn + a.tryBonus + a.losingBonus;
  }

  const sorted = Object.values(rows).sort((x, y) => {
    if (x.totalPoints !== y.totalPoints) {
      return y.totalPoints - x.totalPoints;
    }
    const xDiff = x.pointsFor - x.pointsAgainst;
    const yDiff = y.pointsFor - y.pointsAgainst;
    return yDiff - xDiff;
  });

  return sorted;
}
