import { supabase } from './supabase.js';

let map;
let missions = [];
let currentMission = null;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  document.getElementById('addMission').addEventListener('click', openModal);
  document.getElementById('saveGame').addEventListener('click', saveGameHandler);
  document.getElementById('missionType').addEventListener('change', toggleFields);
  document.querySelector('.close').addEventListener('click', closeModal);
  document.getElementById('missionForm').addEventListener('submit', saveMission);
  document.getElementById('getCurrentLocation').addEventListener('click', useCurrentLocation);
});

function initMap() {
  map = L.map('map').setView([40.4168, -3.7038], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
}

function openModal() {
  currentMission = null;
  document.getElementById('missionForm').reset();
  document.getElementById('missionModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('missionModal').style.display = 'none';
}

function toggleFields(e) {
  document.querySelectorAll('.mission-fields').forEach(f => f.classList.add('hidden'));
  const id = e.target.value + 'Fields';
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function useCurrentLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    document.getElementById('missionLat').value = pos.coords.latitude.toFixed(6);
    document.getElementById('missionLng').value = pos.coords.longitude.toFixed(6);
  });
}

function saveMission(e) {
  e.preventDefault();
  const form = e.target;
  const mission = {
    id: currentMission || Date.now(),
    title: form.missionTitle.value,
    description: form.missionDescription.value,
    type: form.missionType.value,
    points: parseInt(form.missionPoints.value),
    hints: [...form.querySelectorAll('.hint-input')].map(i => i.value.trim()).filter(Boolean)
  };
  if (mission.type === 'gps') {
    mission.lat = parseFloat(form.missionLat.value);
    mission.lng = parseFloat(form.missionLng.value);
  } else if (mission.type === 'question') {
    mission.question = form.missionQuestion.value;
    mission.answer = form.missionAnswer.value;
    mission.answerType = form.answerType.value;
  }
  const idx = missions.findIndex(m => m.id === mission.id);
  idx >= 0 ? missions[idx] = mission : missions.push(mission);
  renderMissions();
  closeModal();
}

function renderMissions() {
  const list = document.getElementById('missionsList');
  list.innerHTML = '';
  missions.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'mission-item';
    div.innerHTML = `
      <div class="mission-header">
        <span class="mission-number">${i + 1}</span>
        <h4>${m.title}</h4>
        <div>
          <button onclick="editMission(${m.id})">✏️</button>
          <button onclick="deleteMission(${m.id})">🗑️</button>
        </div>
      </div>
      <p>${m.description}</p>
      <span class="mission-points">${m.points} pts</span>
    `;
    list.appendChild(div);
  });
}

window.editMission = id => {
  const m = missions.find(m => m.id === id);
  if (!m) return;
  currentMission = id;
  // Rellenar form...
  document.getElementById('missionTitle').value = m.title;
  document.getElementById('missionDescription').value = m.description;
  document.getElementById('missionType').value = m.type;
  document.getElementById('missionPoints').value = m.points;
  // etc.
  openModal();
};

window.deleteMission = id => {
  missions = missions.filter(m => m.id !== id);
  renderMissions();
};

async function saveGameHandler() {
  const title = document.getElementById('gameTitle').value.trim();
  const story = document.getElementById('gameStory').value.trim();
  const duration = parseInt(document.getElementById('gameDuration').value) || 60;
  const initial_points = parseInt(document.getElementById('initialPoints').value) || 100;
  const penalty_points = parseInt(document.getElementById('penaltyPoints').value) || 10;

  if (!title) return alert('Escribe un título para el juego');

  const game = {
    code: generateCode(),
    title,
    story,
    duration,
    initial_points,
    penalty_points,
    missions
  };

  const { error } = await supabase.from('games').upsert([game]);
  if (error) {
    console.error(error);
    alert('Error al guardar: ' + error.message);
  } else {
    alert(`¡Juego guardado! Código: ${game.code}`);
  }
}
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}