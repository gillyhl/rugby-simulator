import { generateFixtures, calcLeaguePoints, computeTable, TEAMS } from './src/utils/seasonUtils.js';

console.log('✓ seasonUtils imports successful');
console.log('Teams count:', TEAMS.length);
console.log('First fixture:', generateFixtures()[0]);
