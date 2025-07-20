import { supabase } from './supabase.js';

let gameState = {
  game: null,
  playerName: '',
  currentMission: 0,
  points: 0,
  startTime: null,
  hintsUsed: [],
  completedMissions: []
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startGame').addEventListener('click', startGame);
  document.getElementById('submitMission').addEventListener('click', checkMission);
  document.getElementById('showHint').addEventListener('click', showHint);
  document.getElementById('playAgain').addEventListener('click', resetGame);
});

async function startGame() {
  const name = document.getElementById('playerName').value.trim();
  const code = document.getElementById('gameCode').value.trim().toUpperCase();
  if (!name || !code) return alert('Completa tu nombre y el código.');

  const { data, error } = await supabase.from('games').select('*').eq('code', code).single();
  if (error || !data) return alert('Código no encontrado');

  gameState = { ...gameState, game: data, playerName: name, points: data.initialPoints, startTime: Date.now() };
  document.getElementById('startScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');
  showMission(0);
  startTimer();
}

function showMission(index) {
  if (index >= gameState.game.missions.length) return finishGame();
  const m = gameState.game.missions[index];
  gameState.currentMission = index;
  document.getElementById('missionTitle').textContent = `Misión ${index + 1}: ${m.title}`;
  document.getElementById('missionStory').textContent = m.description;
  renderMissionContent(m);
}

function renderMissionContent(m) {
  const container = document.getElementById('missionContent');
  container.innerHTML = '';
  if (m.type === 'gps') {
    container.innerHTML = `<p>📍 Dirígete al punto marcado</p><button id="checkLocation" class="btn-primary">Estoy aquí</button>`;
    document.getElementById('checkLocation').addEventListener('click', checkGPS);
  } else if (m.type === 'question') {
    container.innerHTML = `<input id="answerInput" placeholder="Respuesta">`;
  }
}

function checkGPS() {
  const m = gameState.game.missions[gameState.currentMission];
  navigator.geolocation.getCurrentPosition(pos => {
    const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, m.lat, m.lng);
    dist < 20 ? completeMission() : alert(`Estás a ${Math.round(dist)} m`);
  });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function checkMission() {
  const m = gameState.game.missions[gameState.currentMission];
  if (m.type === 'question') {
    const ans = document.getElementById('answerInput').value.trim().toLowerCase();
    const ok = m.answerType === 'exact' ? ans === m.answer.toLowerCase() : ans.includes(m.answer.toLowerCase());
    ok ? completeMission() : alert('Respuesta incorrecta');
  }
}

function completeMission() {
  const m = gameState.game.missions[gameState.currentMission];
  gameState.points += m.points;
  gameState.completedMissions.push({ mission: m.title, points: m.points });
  document.getElementById('points').textContent = `${gameState.points} pts`;
  showMission(gameState.currentMission + 1);
}

function showHint() {
  const m = gameState.game.missions[gameState.currentMission];
  const used = gameState.hintsUsed.filter(h => h.mission === gameState.currentMission).length;
  if (used >= m.hints.length) return alert('No hay más pistas');
  const hint = m.hints[used];
  gameState.hintsUsed.push({ mission: gameState.currentMission, hint });
  gameState.points -= gameState.game.penaltyPoints;
  document.getElementById('points').textContent = `${gameState.points} pts`;
  document.getElementById('hintsList').innerHTML += `<div>💡 ${hint}</div>`;
  document.getElementById('hintsList').classList.remove('hidden');
}

function startTimer() {
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const min = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const sec = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${min}:${sec}`;
  }, 1000);
}

function finishGame() {
  const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
  document.getElementById('finalPoints').textContent = gameState.points;
  document.getElementById('finalTime').textContent = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('resultsScreen').classList.add('active');
}

function resetGame() {
  location.reload();
}