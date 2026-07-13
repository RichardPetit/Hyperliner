// main.js
const gridSize = 22;
const HUMAN_PLAYER_ID = 0;
const BOT_MOVE_INTERVAL_MS = 130;
const gameContainer = document.getElementById('game-container');
const playerColors = [
    "#7FFFD4", // vert d'eau (Aqua)
    "#FF69B4", // rose flashy (Hot Pink)
    "#FFD700", // jaune vif (Gold)
    "#00BFFF", // bleu électrique (Deep Sky Blue)
    "#FF6347", // rouge orangé (Tomato)
    "#32CD32", // vert flashy (Lime Green)
    "#FFA500", // orange (Orange)
    "#BA55D3"  // violet flashy (Medium Orchid)
];
const wallShadow = (color) => `0 0 8px 2px ${color}, 0 0 2px #fff`;


// Génère la grille
for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        gameContainer.appendChild(cell);
    }
}

function updateGridState() {
    // Réinitialise la grille à vide
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            grid[y][x] = { type: "empty", playerId: null };
        }
    }

    // Place joueurs et murs dans la grille
    players.forEach(player => {
        if (!player.alive) return;
        grid[player.y][player.x] = { type: "player", playerId: player.id };

        let wallX = player.x, wallY = player.y;
        if (player.dir === 'up') wallY = (player.y + 1) % gridSize;
        if (player.dir === 'down') wallY = (player.y - 1 + gridSize) % gridSize;
        if (player.dir === 'left') wallX = (player.x + 1) % gridSize;
        if (player.dir === 'right') wallX = (player.x - 1 + gridSize) % gridSize;

        grid[wallY][wallX] = { type: "wall", playerId: player.id };
    });
}

function selectPlayerForInspection(playerId) {
    if (!gameStarted || gameOver) return;
    const player = players[playerId];
    if (!player || !player.alive) return;
    inspectedPlayerId = playerId;
    updateActionDisplay(player);
    renderVehicleRoster();
    renderGrid();
}

function getInspectedPlayer() {
    const player = players[inspectedPlayerId];
    if (player?.alive) return player;
    inspectedPlayerId = HUMAN_PLAYER_ID;
    return players[HUMAN_PLAYER_ID];
}

function renderGrid() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
            if (!cell) continue;

            cell.className = 'cell';
            cell.style.background = '';
            cell.style.boxShadow = '';
            cell.innerHTML = '';

            const cellState = grid[y][x];
            if (cellState.type === 'player') {
                const player = players[cellState.playerId];
                const vehicle = VEHICLES[player.vehicleId];
                cell.classList.add('player', `vehicle-${player.vehicleId}`);
                if (player.id === HUMAN_PLAYER_ID) cell.classList.add('player-human');
                if (player.id === inspectedPlayerId) cell.classList.add('player-inspected');
                if (player.shield) cell.classList.add('shield-active');
                cell.dataset.dir = player.dir;
                cell.style.background = player.color;
                cell.style.cursor = gameStarted && !gameOver ? 'pointer' : '';
                cell.innerHTML = `<span class="vehicle-badge">${vehicle.id}</span>`;
                cell.style.boxShadow = `
          0 0 8px #fff,
          0 0 16px ${player.color},
          0 0 32px ${player.color}
        `;
                if (gameStarted && !gameOver) {
                    cell.onclick = () => selectPlayerForInspection(player.id);
                }
            } else if (cellState.type === 'wall') {
                const player = players[cellState.playerId];
                cell.classList.add('wall', `wall-${player.vehicleId}`);
                cell.style.background = '#888';
                cell.style.boxShadow = `0 0 6px 2px ${player.color}`;
            } else if (cellState.type === 'crash') {
                cell.classList.add('crash');
                cell.style.background = '#e53935';
                cell.innerHTML = '<span class="crash-x">✖</span>';
            } else if (cellState.type === 'mine') {
                const owner = players[cellState.playerId];
                cell.classList.add('wall', `wall-${owner.vehicleId}`, 'mine-wall');
                cell.classList.add(cellState.active ? 'mine-active' : 'mine-pending');
                cell.style.background = '#888';
                cell.style.boxShadow = `0 0 6px 2px ${owner.color}`;
            }
        }
    }
}

function getPlayerPowersSummary(player) {
    const parts = [];
    if (player.shield) parts.push(POWER_LABELS.shield);
    activatablePowers.forEach(key => {
        if (player[key]) parts.push(POWER_LABELS[key]);
    });
    return parts.join(', ');
}

function getVehiclePowersSummary(vehicle) {
    return bonusKeys
        .filter(key => vehicle[key])
        .map(key => POWER_LABELS[key])
        .join(', ');
}

function renderVehicleRoster() {
    const roster = document.getElementById('vehicle-roster');
    if (!roster) return;

    let html = '<div class="roster-title">Véhicules en jeu</div>';
    players.forEach(player => {
        if (!player.alive) return;
        const vehicle = VEHICLES[player.vehicleId];
        const isHuman = player.id === HUMAN_PLAYER_ID;
        const powers = getPlayerPowersSummary(player);
        html += `
          <div class="roster-entry${isHuman ? ' roster-human' : ''}${player.id === inspectedPlayerId ? ' roster-inspected' : ''}" data-player-id="${player.id}">
            <span class="roster-dot" style="background:${player.color}"></span>
            <span class="roster-vehicle">${vehicle.nom} <span class="roster-code">${vehicle.id}</span></span>
            ${isHuman ? '<span class="roster-you">(vous)</span>' : ''}
            <div class="roster-powers">${powers || 'Aucun pouvoir'}</div>
            <div class="roster-frags">${player.frags || 0} frag${(player.frags || 0) !== 1 ? 's' : ''}</div>
          </div>`;
    });
    roster.innerHTML = html;
    roster.querySelectorAll('.roster-entry').forEach(entry => {
        entry.onclick = () => selectPlayerForInspection(Number(entry.dataset.playerId));
    });
}

let selectedVehicleId = 'snypase';
let gameStarted = false;
let gameOver = false;
let endScreenVisible = true;
let inspectedPlayerId = HUMAN_PLAYER_ID;

function initSetupScreen() {
    const container = document.getElementById('vehicle-choices');
    if (!container) return;

    container.innerHTML = '';
    Object.entries(VEHICLES).forEach(([key, vehicle]) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'vehicle-choice-card';
        card.dataset.vehicleId = key;
        const powers = getVehiclePowersSummary(vehicle);
        card.innerHTML = `
            <span class="vehicle-choice-name">${vehicle.nom}</span>
            <span class="roster-code">${vehicle.id}</span>
            <span class="vehicle-choice-powers">${powers || 'Aucun pouvoir'}</span>`;
        card.onclick = () => selectSetupVehicle(key);
        container.appendChild(card);
    });

    selectSetupVehicle(selectedVehicleId);

    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.onclick = startGame;
}

function selectSetupVehicle(vehicleId) {
    if (!VEHICLES[vehicleId]) return;
    selectedVehicleId = vehicleId;
    document.querySelectorAll('.vehicle-choice-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.vehicleId === vehicleId);
    });
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;

    const setupScreen = document.getElementById('setup-screen');
    const gameUi = document.getElementById('game-ui');
    if (setupScreen) setupScreen.classList.add('hidden');
    if (gameUi) gameUi.classList.remove('game-ui-hidden');

    initializeMatch();
    renderGrid();
    renderVehicleRoster();
    updateActionDisplay(players[HUMAN_PLAYER_ID]);
    showDirectionControls(players[HUMAN_PLAYER_ID]);
    showPowerControls(players[HUMAN_PLAYER_ID]);
}

function setHumanVehicle(vehicleId) {
    const player = players[HUMAN_PLAYER_ID];
    if (!VEHICLES[vehicleId]) return;

    player.vehicleId = vehicleId;
    const vehicle = VEHICLES[vehicleId];
    initPlayerPowers(player);
    player.actionGauge = Math.min(player.actionGauge, vehicle.maxActionGauge);

    if (gameStarted) {
        showPowerControls(player);
        updateActionDisplay(player);
        renderVehicleRoster();
        renderGrid();
    }
}

const players = [
    {
        id: 0,
        x: 7,
        y: 17,
        dir: 'up',
        latence: 0,
        color: "#7FFFD4",
        alive: true,
        score: 0,
        vehicleId: 'snypase',
        actionGauge: 0,
        lastActionTime: Date.now()
    },
    {
        id: 1,
        x: 14,
        y: 17,
        dir: 'up',
        latence: 0,
        color: "#FF69B4",
        alive: true,
        score: 0,
        vehicleId: 'kortex',
        actionGauge: 0,
        lastActionTime: Date.now()
    },
    {
        id: 2,
        x: 7,
        y: 4,
        dir: 'down',
        latence: 0,
        color: "#FFD700",
        alive: true,
        score: 0,
        vehicleId: 'psionide',
        actionGauge: 0,
        lastActionTime: Date.now()
    },
    {
        id: 3,
        x: 14,
        y: 4,
        dir: 'down',
        latence: 0,
        color: "#00BFFF",
        alive: true,
        score: 0,
        vehicleId: 'vulture',
        actionGauge: 0,
        lastActionTime: Date.now()
    },
    {
        id: 4,
        x: 4,
        y: 7,
        dir: 'right',
        latence: 0,
        color: "#FF6347",
        alive: true,
        score: 0,
        vehicleId: 'mighty',
        actionGauge: 0,
        lastActionTime: Date.now()
    },
    {
        id: 5,
        x: 4,
        y: 14,
        dir: 'right',
        latence: 0,
        color: "#32CD32",
        alive: true,
        score: 0,
        vehicleId: 'banshee',
        actionGauge: 0,
        lastActionTime: Date.now()
    },
    {
        id: 6,
        x: 17,
        y: 7,
        dir: 'left',
        latence: 0,
        color: "#BA55D3",
        alive: true,
        score: 0,
        vehicleId: 'duck',
        actionGauge: 0,
        lastActionTime: Date.now()
    },
    {
        id: 7,
        x: 17,
        y: 14,
        dir: 'left',
        latence: 0,
        color: "#FFA500",
        alive: true,
        score: 0,
        vehicleId: 'psionide',
        actionGauge: 0,
        lastActionTime: Date.now()
    },
];


const PLAYER_SPAWN_DATA = players.map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    dir: p.dir,
    color: p.color,
    vehicleId: p.vehicleId,
}));



/*PARTIE VEHICULES ET BONUS*/


class Vehicle {
    constructor(options) {
        this.id = options.id;
        this.nom = options.nom;
        this.maxActionGauge = options.maxActionGauge;
        this.rechargeTime = options.rechargeTime;
        this.latenceTourner = options.latenceTourner;
        this.shield = options.shield || false;
        this.teleporter = options.teleporter || false;
        this.jammer = options.jammer || false;
        this.mine = options.mine || false;
        this.boost = options.boost || false;
        this.aerobrake = options.aerobrake || false;
        this.missile = options.missile || false;
    }
}

const JAMMER_LATENCE = 4;
const MINE_DETECTION_RANGE = 2;
const MINE_EXPLOSION_RADIUS = 4;

const POWER_LABELS = {
    shield: 'Bouclier',
    teleporter: 'Téléporteur',
    jammer: 'Canon OEN',
    mine: 'Mine',
    boost: 'Boost',
    aerobrake: 'Aérofrein',
    missile: 'Missile',
};

const VEHICLES = {
    snypase: new Vehicle({
        id: 'Sny',
        nom: 'Snypase',
        maxActionGauge: 6,
        rechargeTime: 1200,
        latenceTourner: 4,
        boost: true,
        aerobrake: true,
    }),
    psionide: new Vehicle({
        id: 'Psio',
        nom: 'Psionide',
        maxActionGauge: 11,
        rechargeTime: 2000,
        latenceTourner: 2,
        boost: true,
        aerobrake: true,
        jammer: true,
    }),
    bison: new Vehicle({
        id: 'Bis',
        nom: 'Bison',
        maxActionGauge: 9,
        rechargeTime: 100,
        latenceTourner: 3,
        boost: true,
        aerobrake: true,
        shield: true,
        missile: true,
    }),
    vulture: new Vehicle({
        id: 'Vul',
        nom: 'Vulture',
        maxActionGauge: 8,
        rechargeTime: 1200,
        latenceTourner: 2,
        boost: true,
        aerobrake: true,
        mine: true,
    }),
    kortex: new Vehicle({
        id: 'Kor',
        nom: 'Kortex',
        maxActionGauge: 8,
        rechargeTime: 1200,
        latenceTourner: 2,
        boost: true,
        aerobrake: true,
        missile: true,
        shield: true,
        teleporter: true,
    }),
    banshee: new Vehicle({
        id: 'Ban',
        nom: 'Banshee',
        maxActionGauge: 8,
        rechargeTime: 1000,
        latenceTourner: 2,
        boost: true,
        missile: true,
    }),
    mighty: new Vehicle({
        id: 'Mig',
        nom: 'Mighty',
        maxActionGauge: 8,
        rechargeTime: 1200,
        latenceTourner: 2,
        aerobrake: true,
    }),
    duck: new Vehicle({
        id: 'Duc',
        nom: 'Duck',
        maxActionGauge: 8,
        rechargeTime: 1200,
        latenceTourner: 2,
    }),
}
//const vehicle = VEHICLES[player.vehicleId];


const bonusKeys = [
    'shield', 'teleporter', 'jammer', 'mine', 'boost', 'aerobrake', 'missile'
];

const activatablePowers = [
    'teleporter', 'jammer', 'mine', 'boost', 'aerobrake', 'missile'
];

function initPlayerPowers(player) {
    const vehicle = VEHICLES[player.vehicleId];
    player.shield = !!vehicle.shield;
    activatablePowers.forEach(key => {
        player[key] = !!vehicle[key];
        player[`${key}Used`] = false;
    });
}

function placePlayersOnGrid() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            grid[y][x] = { type: "empty", playerId: null };
        }
    }

    players.forEach(player => {
        if (!player.alive) return;
        grid[player.y][player.x] = { type: "player", playerId: player.id };

        const { x: wallX, y: wallY } = getWallBehind(player);
        grid[wallY][wallX] = { type: "wall", playerId: player.id };
    });
}

function initializeMatch() {
    gameOver = false;
    inspectedPlayerId = HUMAN_PLAYER_ID;
    pendingBotMoves.length = 0;
    lastBotMoveAt = 0;

    players.forEach(player => {
        const spawn = PLAYER_SPAWN_DATA.find(s => s.id === player.id);
        player.x = spawn.x;
        player.y = spawn.y;
        player.dir = spawn.dir;
        player.color = spawn.color;
        player.vehicleId = spawn.vehicleId;
        player.latence = 0;
        player.alive = true;
        player.frags = 0;
        player.actionGauge = 0;
        initPlayerPowers(player);
    });

    setHumanVehicle(selectedVehicleId);
    placePlayersOnGrid();

    const now = Date.now();
    players[HUMAN_PLAYER_ID].lastActionTime = now;
    players.forEach(player => {
        if (player.id !== HUMAN_PLAYER_ID) {
            player.lastActionTime = now + player.id * 250;
        }
    });
}

function awardFrag(killerId, victimId) {
    if (killerId === null || killerId === undefined || killerId === victimId) return;
    const killer = players[killerId];
    if (!killer) return;
    killer.frags = (killer.frags || 0) + 1;
}

function eliminatePlayer(victimId, killerId = null) {
    const victim = players[victimId];
    if (!victim || !victim.alive) return;

    victim.alive = false;
    awardFrag(killerId, victimId);
    renderVehicleRoster();
    checkGameOver();
}

function checkGameOver() {
    if (!gameStarted || gameOver) return;

    const alivePlayers = players.filter(p => p.alive);
    const human = players[HUMAN_PLAYER_ID];

    if (alivePlayers.length <= 1) {
        endGame(alivePlayers[0] || null);
    } else if (!human.alive) {
        endGame(null);
    }
}

function showEndScreen(winner) {
    const endScreen = document.getElementById('end-screen');
    const endTitle = document.getElementById('end-title');
    const endSubtitle = document.getElementById('end-subtitle');
    const leaderboard = document.getElementById('end-leaderboard');
    const human = players[HUMAN_PLAYER_ID];

    if (!endScreen || !leaderboard) return;

    if (winner && winner.id === HUMAN_PLAYER_ID) {
        endTitle.textContent = 'Victoire !';
        endSubtitle.textContent = 'Vous êtes le dernier survivant.';
    } else if (!human.alive) {
        endTitle.textContent = 'Défaite';
        endSubtitle.textContent = winner
            ? `${VEHICLES[winner.vehicleId].nom} remporte la partie.`
            : 'Vous avez été éliminé.';
    } else {
        endTitle.textContent = 'Partie terminée';
        endSubtitle.textContent = winner
            ? `${VEHICLES[winner.vehicleId].nom} est le dernier survivant.`
            : 'Classement final.';
    }

    const ranking = [...players].sort((a, b) => {
        if (b.frags !== a.frags) return b.frags - a.frags;
        if (a.alive !== b.alive) return a.alive ? -1 : 1;
        return a.id - b.id;
    });

    let html = '<div class="end-leaderboard-header"><span>#</span><span>Joueur</span><span>Frags</span></div>';
    ranking.forEach((player, index) => {
        const vehicle = VEHICLES[player.vehicleId];
        const isHuman = player.id === HUMAN_PLAYER_ID;
        const isWinner = winner && player.id === winner.id;
        html += `
            <div class="end-row${isHuman ? ' end-row-human' : ''}${isWinner ? ' end-row-winner' : ''}">
                <span class="end-rank">${index + 1}</span>
                <span class="end-player">
                    <span class="roster-dot" style="background:${player.color}"></span>
                    ${vehicle.nom} <span class="roster-code">${vehicle.id}</span>
                    ${isHuman ? '<span class="roster-you">(vous)</span>' : ''}
                    <span class="end-status">${player.alive ? 'En vie' : 'Éliminé'}</span>
                </span>
                <span class="end-frags">${player.frags || 0}</span>
            </div>`;
    });

    leaderboard.innerHTML = html;
    endScreenVisible = true;
    updateEndScreenVisibility();
}

function updateEndScreenVisibility() {
    const endScreen = document.getElementById('end-screen');
    const toggleBtn = document.getElementById('toggle-results-btn');
    if (!endScreen || !toggleBtn) return;

    endScreen.classList.toggle('hidden', !endScreenVisible);
    toggleBtn.classList.remove('hidden');
    toggleBtn.textContent = endScreenVisible ? 'Masquer le classement' : 'Voir le classement';
}

function toggleEndScreen() {
    endScreenVisible = !endScreenVisible;
    updateEndScreenVisibility();
}

function hideEndScreenUi() {
    endScreenVisible = true;
    const endScreen = document.getElementById('end-screen');
    const toggleBtn = document.getElementById('toggle-results-btn');
    if (endScreen) endScreen.classList.add('hidden');
    if (toggleBtn) toggleBtn.classList.add('hidden');
}

function endGame(winner) {
    if (gameOver) return;
    gameOver = true;
    pendingBotMoves.length = 0;
    showEndScreen(winner);
}

function restartMatch() {
    hideEndScreenUi();

    initializeMatch();
    renderGrid();
    renderVehicleRoster();
    updateActionDisplay(players[HUMAN_PLAYER_ID]);
    showDirectionControls(players[HUMAN_PLAYER_ID]);
    showPowerControls(players[HUMAN_PLAYER_ID]);
}

function returnToMenu() {
    gameStarted = false;
    gameOver = false;
    pendingBotMoves.length = 0;

    hideEndScreenUi();

    const gameUi = document.getElementById('game-ui');
    const setupScreen = document.getElementById('setup-screen');
    if (gameUi) gameUi.classList.add('game-ui-hidden');
    if (setupScreen) setupScreen.classList.remove('hidden');
}

function initEndScreen() {
    const replayBtn = document.getElementById('replay-btn');
    const menuBtn = document.getElementById('menu-btn');
    const toggleBtn = document.getElementById('toggle-results-btn');
    if (replayBtn) replayBtn.onclick = restartMatch;
    if (menuBtn) menuBtn.onclick = returnToMenu;
    if (toggleBtn) toggleBtn.onclick = toggleEndScreen;
}

players.forEach(player => {
    player.frags = 0;
    initPlayerPowers(player);
});

/* fin partie véhicules et bonus */






let grid = [];
for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
        grid[y][x] = {
            type: "empty",
            playerId: null
        };
    }
}

placePlayersOnGrid();

initSetupScreen();
initEndScreen();
renderGrid();
renderVehicleRoster();

function getSafeDirections(player) {
    return getPossibleDirections(player).filter(dir => isDirectionSafe(player, dir));
}

function showDirectionControls(player) {
    const controls = document.getElementById('controls');
    controls.innerHTML = '';

    const safeDirections = getSafeDirections(player);

    safeDirections.forEach(direction => {
        const btn = document.createElement('button');
        btn.className = 'arrow-btn arrow-' + direction;
        btn.innerHTML = getArrowSymbol(direction);
        btn.onclick = () => handleDirectionClick(direction);
        controls.appendChild(btn);
    });
}

const KEY_DIRECTIONS = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
};

function handleKeyboardInput(event) {
    if (!gameStarted || gameOver) return;

    const direction = KEY_DIRECTIONS[event.key];
    if (!direction) return;

    const player = players[HUMAN_PLAYER_ID];
    if (!player.alive) return;

    if (!getSafeDirections(player).includes(direction)) return;

    event.preventDefault();
    handleDirectionClick(direction);
}

document.addEventListener('keydown', handleKeyboardInput);

function getWallBehind(player) {
    let wallX = player.x;
    let wallY = player.y;
    if (player.dir === 'up') wallY = (player.y + 1) % gridSize;
    if (player.dir === 'down') wallY = (player.y - 1 + gridSize) % gridSize;
    if (player.dir === 'left') wallX = (player.x + 1) % gridSize;
    if (player.dir === 'right') wallX = (player.x - 1 + gridSize) % gridSize;
    return { x: wallX, y: wallY };
}

function torusDelta(a, b) {
    return Math.min(Math.abs(a - b), gridSize - Math.abs(a - b));
}

function torusChebyshevDist(x1, y1, x2, y2) {
    return Math.max(torusDelta(x1, x2), torusDelta(y1, y2));
}

function isBlockingCell(type) {
    return type === 'wall' || type === 'mine';
}

function getNextPosition(x, y, direction) {
    let nextX = x;
    let nextY = y;
    if (direction === 'up') nextY = (y - 1 + gridSize) % gridSize;
    if (direction === 'down') nextY = (y + 1) % gridSize;
    if (direction === 'left') nextX = (x - 1 + gridSize) % gridSize;
    if (direction === 'right') nextX = (x + 1) % gridSize;
    return { x: nextX, y: nextY };
}

function getPossibleDirections(player) {
    if (player.latence > 0) {
        return [player.dir];
    }
    if (player.dir === 'up' || player.dir === 'down') {
        return ['left', player.dir, 'right'];
    }
    return ['up', player.dir, 'down'];
}

function isDirectionSafe(player, direction) {
    const { x: nextX, y: nextY } = getNextPosition(player.x, player.y, direction);
    const nextType = grid[nextY][nextX].type;

    if (nextType === "empty") return true;
    if (player.shield && isBlockingCell(nextType)) return true;

    if ((direction === 'up' && player.dir === 'down') ||
        (direction === 'down' && player.dir === 'up') ||
        (direction === 'left' && player.dir === 'right') ||
        (direction === 'right' && player.dir === 'left')) {
        return false;
    }

    return false;
}

function countOpenSpace(x, y, direction) {
    let cx = x;
    let cy = y;
    let count = 0;
    for (let i = 0; i < gridSize; i++) {
        const next = getNextPosition(cx, cy, direction);
        if (grid[next.y][next.x].type !== "empty") break;
        count++;
        cx = next.x;
        cy = next.y;
    }
    return count;
}

function isCellTargetedByOther(player, x, y) {
    for (const other of players) {
        if (!other.alive || other.id === player.id) continue;
        const vehicle = VEHICLES[other.vehicleId];
        const canMove = other.actionGauge > 0 || other.actionGauge >= vehicle.maxActionGauge;
        if (!canMove) continue;

        const target = getNextPosition(other.x, other.y, other.dir);
        if (target.x === x && target.y === y) return true;
    }
    return false;
}

function scoreDirection(player, direction) {
    const { x: nextX, y: nextY } = getNextPosition(player.x, player.y, direction);
    let score = countOpenSpace(nextX, nextY, direction) * 3;

    if (direction === player.dir) score += 2;

    for (const other of players) {
        if (!other.alive || other.id === player.id) continue;
        const dist = Math.abs(other.x - nextX) + Math.abs(other.y - nextY);
        if (dist <= 1) score -= 40;
        else if (dist <= 3) score -= 8 / dist;
    }

    if (isCellTargetedByOther(player, nextX, nextY)) score -= 50;

    const leftTurn = getLeftDirection(player.dir);
    const rightTurn = getRightDirection(player.dir);
    if (direction === leftTurn || direction === rightTurn) {
        const straightSpace = countOpenSpace(player.x, player.y, player.dir);
        if (straightSpace <= 2) score += 5;
    }

    return score + Math.random() * 0.5;
}

function getLeftDirection(dir) {
    const turns = { up: 'left', left: 'down', down: 'right', right: 'up' };
    return turns[dir];
}

function getRightDirection(dir) {
    const turns = { up: 'right', right: 'down', down: 'left', left: 'up' };
    return turns[dir];
}

function chooseBotDirection(player) {
    const possible = getPossibleDirections(player);
    const safe = possible.filter(dir => isDirectionSafe(player, dir));

    if (safe.length === 0) return player.dir;
    if (safe.length === 1) return safe[0];

    let bestDir = safe[0];
    let bestScore = -Infinity;
    for (const dir of safe) {
        const score = scoreDirection(player, dir);
        if (score > bestScore) {
            bestScore = score;
            bestDir = dir;
        }
    }
    return bestDir;
}

function executePlayerMove(player, direction) {
    const vehicle = VEHICLES[player.vehicleId];
    if (player.actionGauge <= 0) return false;
    if (player.latence > 0 && direction !== player.dir) return false;

    if (direction !== player.dir) {
        player.dir = direction;
        player.latence = vehicle.latenceTourner;
    }

    player.actionGauge--;
    movePlayer(player);
    return true;
}

function botAutoMove(player) {
    const power = chooseBotPower(player);
    if (power) {
        pendingBotMoves.unshift({ playerId: player.id, type: 'power', powerKey: power });
        return;
    }

    const vehicle = VEHICLES[player.vehicleId];
    const direction = chooseBotDirection(player);

    if (direction !== player.dir && player.latence === 0) {
        player.dir = direction;
        player.latence = vehicle.latenceTourner;
    }

    movePlayer(player);
}

const pendingBotMoves = [];
let lastBotMoveAt = 0;

function isBotQueued(playerId) {
    return pendingBotMoves.some(entry => entry.playerId === playerId);
}

function scheduleBotMove(player, type, powerKey = null) {
    if (!player.alive || isBotQueued(player.id)) return;
    pendingBotMoves.push({ playerId: player.id, type, powerKey });
}

function getDirectionVector(dir) {
    if (dir === 'up') return { dx: 0, dy: -1 };
    if (dir === 'down') return { dx: 0, dy: 1 };
    if (dir === 'left') return { dx: -1, dy: 0 };
    return { dx: 1, dy: 0 };
}

function scanForward(player, maxDist = 4) {
    const { dx, dy } = getDirectionVector(player.dir);
    let x = player.x;
    let y = player.y;

    for (let i = 0; i < maxDist; i++) {
        x = (x + dx + gridSize) % gridSize;
        y = (y + dy + gridSize) % gridSize;
        const cell = grid[y][x];
        if (cell.type !== 'empty') {
            return { x, y, type: cell.type, dist: i + 1, playerId: cell.playerId };
        }
    }
    return null;
}

function findClosestEnemy(player, maxDist = Infinity) {
    let closest = null;
    let minDist = maxDist;

    players.forEach(p => {
        if (!p.alive || p.id === player.id) return;
        const dist = torusChebyshevDist(player.x, player.y, p.x, p.y);
        if (dist < minDist) {
            minDist = dist;
            closest = p;
        }
    });

    return closest;
}

function canUsePower(player, key) {
    return player[key] && !player[`${key}Used`];
}

function chooseBotPower(player) {
    const straightSafe = isDirectionSafe(player, player.dir);
    const straightSpace = countOpenSpace(player.x, player.y, player.dir);
    const safeDirs = getSafeDirections(player);
    const forward = scanForward(player, 4);
    const closestEnemy = findClosestEnemy(player, 8);
    const enemyDist = closestEnemy
        ? torusChebyshevDist(player.x, player.y, closestEnemy.x, closestEnemy.y)
        : Infinity;

    if (canUsePower(player, 'missile') && forward) {
        if (forward.type === 'player') return 'missile';
        if ((forward.type === 'wall' || forward.type === 'mine') && straightSpace <= 2) {
            return 'missile';
        }
    }

    if (canUsePower(player, 'aerobrake')) {
        if (player.latence >= 2 && !straightSafe) return 'aerobrake';
        if (player.latence > 0 && safeDirs.length <= 1) return 'aerobrake';
    }

    if (canUsePower(player, 'boost')) {
        if (!straightSafe && safeDirs.length <= 1) return 'boost';
        if (!straightSafe && player.latence > 0) return 'boost';
        if (straightSpace <= 1 && safeDirs.length <= 2) return 'boost';
    }

    if (canUsePower(player, 'teleporter')) {
        if (safeDirs.length === 0) return 'teleporter';
        if (!straightSafe && safeDirs.length === 1 && straightSpace === 0) return 'teleporter';
    }

    if (canUsePower(player, 'jammer') && closestEnemy && enemyDist <= 5) {
        if (closestEnemy.id === HUMAN_PLAYER_ID || enemyDist <= 4) return 'jammer';
    }

    if (canUsePower(player, 'mine')) {
        const { x: wallX, y: wallY } = getWallBehind(player);
        const wall = grid[wallY][wallX];
        if (wall.type === 'wall' && wall.playerId === player.id) {
            if (closestEnemy && enemyDist <= 6) return 'mine';
            if (straightSpace <= 2 && Math.random() < 0.25) return 'mine';
        }
    }

    return null;
}

function performBotDecidedMove(player) {
    executePlayerMove(player, chooseBotDirection(player));
}

function processBotMoveQueue(now) {
    if (!gameStarted || gameOver || pendingBotMoves.length === 0) return false;
    if (now - lastBotMoveAt < BOT_MOVE_INTERVAL_MS) return false;

    const entry = pendingBotMoves.shift();
    const player = players[entry.playerId];
    if (!player || !player.alive) {
        return processBotMoveQueue(now);
    }

    if (entry.type === 'power') {
        activatePower(player, entry.powerKey);
    } else {
        if (entry.type === 'auto') {
            botAutoMove(player);
        } else {
            performBotDecidedMove(player);
        }
        renderGrid();
        const human = players[HUMAN_PLAYER_ID];
        if (human.alive) showDirectionControls(human);
    }

    lastBotMoveAt = now;
    return true;
}

function maybeBotAct(player) {
    const vehicle = VEHICLES[player.vehicleId];
    if (player.actionGauge <= 0 || isBotQueued(player.id)) return;

    const power = chooseBotPower(player);
    if (power) {
        scheduleBotMove(player, 'power', power);
        return;
    }

    const straightSafe = isDirectionSafe(player, player.dir);

    if (!straightSafe) {
        scheduleBotMove(player, 'decide');
        return;
    }

    if (player.actionGauge >= vehicle.maxActionGauge - 1) {
        scheduleBotMove(player, 'decide');
        return;
    }

    const bestDir = chooseBotDirection(player);
    const straightSpace = countOpenSpace(player.x, player.y, player.dir);
    if (bestDir !== player.dir && player.latence === 0 && straightSpace <= 3) {
        scheduleBotMove(player, 'decide');
        return;
    }

    if (Math.random() < 0.04 && player.actionGauge > 2) {
        scheduleBotMove(player, 'decide');
    }
}

function getArrowSymbol(dir) {
    switch (dir) {
        case 'up': return '\u2191';
        case 'down': return '\u2193';
        case 'left': return '\u2190';
        case 'right': return '\u2192';
        default: return '';
    }
}


function consumeShield(player) {
    if (!player.shield) return;
    player.shield = false;
    if (player.id === HUMAN_PLAYER_ID) {
        updateActionDisplay(player);
        showDirectionControls(player);
    }
    renderGrid();
}

function movePlayer(player) {
    let nextX = player.x;
    let nextY = player.y;
    if (player.dir === 'up') nextY = (player.y - 1 + gridSize) % gridSize;
    if (player.dir === 'down') nextY = (player.y + 1) % gridSize;
    if (player.dir === 'left') nextX = (player.x - 1 + gridSize) % gridSize;
    if (player.dir === 'right') nextX = (player.x + 1) % gridSize;

    const targetType = grid[nextY][nextX].type;

    if (targetType === "wall" && player.shield) {
        grid[nextY][nextX] = { type: "empty", playerId: null };
        consumeShield(player);
        grid[player.y][player.x] = { type: "wall", playerId: player.id };
        player.x = nextX;
        player.y = nextY;
        grid[player.y][player.x] = { type: "player", playerId: player.id };
        if (player.latence > 0) player.latence--;
        updateMinesAfterMove(player);
        return;
    }

    if (targetType === "mine" && player.shield) {
        grid[nextY][nextX] = { type: "empty", playerId: null };
        consumeShield(player);
        grid[player.y][player.x] = { type: "wall", playerId: player.id };
        player.x = nextX;
        player.y = nextY;
        grid[player.y][player.x] = { type: "player", playerId: player.id };
        if (player.latence > 0) player.latence--;
        updateMinesAfterMove(player);
        return;
    }

    if (targetType !== "empty") {
        if (isBlockingCell(targetType) || targetType === "player" || targetType === "crash") {
            if (targetType === "player") {
                const otherPlayerId = grid[nextY][nextX].playerId;
                grid[player.y][player.x] = { type: "wall", playerId: player.id };
                grid[nextY][nextX] = { type: "crash", playerId: player.id };
                eliminatePlayer(otherPlayerId, player.id);
                eliminatePlayer(player.id);
            } else {
                const obstacleOwnerId = grid[nextY][nextX].ownerId ?? grid[nextY][nextX].playerId;
                const killerId = obstacleOwnerId !== player.id ? obstacleOwnerId : null;
                grid[player.y][player.x] = { type: "wall", playerId: player.id };
                grid[nextY][nextX] = { type: "crash", playerId: player.id };
                eliminatePlayer(player.id, killerId);
            }

            renderGrid();
            return;
        }
    }

    grid[player.y][player.x] = { type: "wall", playerId: player.id };

    player.x = nextX;
    player.y = nextY;
    grid[player.y][player.x] = { type: "player", playerId: player.id };

    if (player.latence > 0) player.latence--;
    updateMinesAfterMove(player);
}

function rechargeActions() {
    if (!gameStarted || gameOver) return;

    const now = Date.now();
    let humanNeedsRender = false;
    const human = players[HUMAN_PLAYER_ID];

    players.forEach(player => {
        if (!player.alive) return;
        const vehicle = VEHICLES[player.vehicleId];
        const isHuman = player.id === HUMAN_PLAYER_ID;

        if (player.actionGauge < vehicle.maxActionGauge &&
            now - player.lastActionTime >= vehicle.rechargeTime) {
            player.actionGauge++;
            player.lastActionTime = now;
            if (isHuman) {
                updateActionDisplay(getInspectedPlayer());
            } else {
                maybeBotAct(player);
            }
            return;
        }

        if (player.actionGauge >= vehicle.maxActionGauge &&
            now - player.lastActionTime >= vehicle.rechargeTime) {
            if (isHuman) {
                movePlayer(player);
                showDirectionControls(player);
                updateActionDisplay(getInspectedPlayer());
                humanNeedsRender = true;
            } else {
                scheduleBotMove(player, 'auto');
            }
            player.lastActionTime = now;
        }
    });

    const botMoved = processBotMoveQueue(now);

    if (!humanNeedsRender && !botMoved && gameStarted && !gameOver) {
        updateActionDisplay(getInspectedPlayer());
    }

    if (humanNeedsRender && !botMoved) {
        renderGrid();
        if (human.alive) showDirectionControls(human);
    }
}



setInterval(rechargeActions, 100);

function handleDirectionClick(direction) {
    if (!gameStarted || gameOver) return;
    const player = players[HUMAN_PLAYER_ID];
    if (executePlayerMove(player, direction)) {
        renderGrid();
        showDirectionControls(player);
        updateActionDisplay(getInspectedPlayer());
    }
}


function updateActionDisplay(player) {
    const gauge = document.getElementById('action-gauge');
    const vehicle = VEHICLES[player.vehicleId];
    const isHuman = player.id === HUMAN_PLAYER_ID;

    let html = `<div class="vehicle-panel-name">${vehicle.nom} <span class="roster-code">${vehicle.id}</span></div>`;
    if (isHuman) {
        html += '<div class="inspect-label">Votre véhicule</div>';
    } else {
        html += '<div class="inspect-label">Adversaire observé — cliquez un véhicule pour inspecter</div>';
    }
    html += `<div class="vehicle-panel-powers">${getPlayerPowersSummary(player)}</div>`;
    html += `<div class="vehicle-panel-frags">${player.frags || 0} frag${(player.frags || 0) !== 1 ? 's' : ''}</div>`;

    html += '<div style="margin-top:12px"><b>Actions</b><br>';
    for (let i = vehicle.maxActionGauge; i > 0; i--) {
        html += `<div style="width:28px;height:18px; background:${i <= player.actionGauge ? '#0af' : '#eee'}; border-radius:4px; margin:2px auto"></div>`;
    }
    html += '</div>';

    html += '<div style="margin-top:12px"><b>Latence</b><br>';
    if (player.latence > 0) {
        for (let i = player.latence; i > 0; i--) {
            html += `<div style="width:28px;height:18px; background:#f66; border-radius:4px; margin:2px auto"></div>`;
        }
    } else {
        html += '<div class="no-latence">Aucune</div>';
    }
    html += '</div>';

    if (player.shield) {
        html += '<div class="shield-status">Bouclier disponible</div>';
    }

    gauge.innerHTML = html;
}

function showPowerControls(player) {
    const powerControls = document.getElementById('power-controls');
    powerControls.innerHTML = '';

    activatablePowers.forEach(key => {
        if (!player[key]) return;

        const btn = document.createElement('button');
        btn.textContent = POWER_LABELS[key];
        const used = player[`${key}Used`];

        if (used) {
            btn.disabled = true;
            btn.classList.add('power-used');
        } else {
            btn.classList.add('power-available');
            btn.onclick = () => {
                activatePower(player, key);
            };
        }

        powerControls.appendChild(btn);
    });
}

function activatePower(player, powerKey) {
    if (!gameStarted) return false;
    if (!player[powerKey] || player[`${powerKey}Used`]) return false;

    let success = true;

    switch (powerKey) {
        case 'teleporter':
            activateTeleporter(player);
            break;
        case 'jammer':
            activateJammer(player);
            break;
        case 'mine':
            success = activateMine(player);
            break;
        case 'boost':
            activateBoost(player);
            break;
        case 'aerobrake':
            activateAerobrake(player);
            break;
        case 'missile':
            activateMissile(player);
            break;
        default:
            return false;
    }

    if (!success) return false;

    player[`${powerKey}Used`] = true;

    renderGrid();
    renderVehicleRoster();
    if (player.id === HUMAN_PLAYER_ID) {
        updateActionDisplay(player);
        showDirectionControls(player);
        showPowerControls(player);
    }
    return true;
}



function playMissileTrail(path, dx) {
    const trailClass = dx !== 0 ? 'missile-trail-horizontal' : 'missile-trail-vertical';
    path.forEach((pos, index) => {
        setTimeout(() => {
            const cell = document.querySelector(`.cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
            if (!cell) return;
            cell.classList.add(trailClass);
            setTimeout(() => cell.classList.remove(trailClass), 600);
        }, index * 120);
    });
}

function activateMissile(player) {
    let x = player.x;
    let y = player.y;
    let dx = 0;
    let dy = 0;

    if (player.dir === 'up') dy = -1;
    if (player.dir === 'down') dy = 1;
    if (player.dir === 'left') dx = -1;
    if (player.dir === 'right') dx = 1;

    const trailPath = [];

    for (let i = 0; i < 4; i++) {
        x = (x + dx + gridSize) % gridSize;
        y = (y + dy + gridSize) % gridSize;
        trailPath.push({ x, y });

        if (grid[y][x].type === 'wall' || grid[y][x].type === 'mine' || grid[y][x].type === 'player' || grid[y][x].type === 'crash') {
            const target = grid[y][x];
            if (target.type === 'player') {
                const targetPlayer = players[target.playerId];
                if (!targetPlayer.shield) {
                    grid[y][x] = { type: "crash", playerId: null };
                    eliminatePlayer(targetPlayer.id, player.id);
                } else {
                    consumeShield(targetPlayer);
                }
            } else {
                grid[y][x] = { type: "empty", playerId: null };
            }
            break;
        }
    }

    playMissileTrail(trailPath, dx);
}

function activateAerobrake(player) {
    player.latence = 0;
    player.actionGauge = 0;
    if (player.id === HUMAN_PLAYER_ID) {
        updateActionDisplay(player);
        showDirectionControls(player);
    }
}


function activateTeleporter(player) {
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * gridSize);
        newY = Math.floor(Math.random() * gridSize);
    } while (grid[newY][newX].type !== "empty");

    grid[player.y][player.x] = { type: "empty", playerId: null };
    player.x = newX;
    player.y = newY;
    grid[player.y][player.x] = { type: "player", playerId: player.id };

    updateMinesAfterMove(player);
    if (player.id === HUMAN_PLAYER_ID) {
        showDirectionControls(player);
    }
}


function torusDistance(x1, y1, x2, y2) {
    const dx = Math.min(Math.abs(x1 - x2), gridSize - Math.abs(x1 - x2));
    const dy = Math.min(Math.abs(y1 - y2), gridSize - Math.abs(y1 - y2));
    return Math.sqrt(dx * dx + dy * dy);
}

function activateJammer(player) {
    let closestPlayer = null;
    let minDistance = Infinity;

    players.forEach(p => {
        if (p.id !== player.id && p.alive) {
            const distance = torusDistance(player.x, player.y, p.x, p.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestPlayer = p;
            }
        }
    });

    if (!closestPlayer) return;

    closestPlayer.latence = JAMMER_LATENCE;
    closestPlayer.jammedUntil = Date.now() + 800;

    const cell = document.querySelector(
        `.cell[data-x="${closestPlayer.x}"][data-y="${closestPlayer.y}"]`
    );
    if (cell) {
        cell.classList.add('jammer-hit');
        setTimeout(() => cell.classList.remove('jammer-hit'), 800);
    }

    if (closestPlayer.id === HUMAN_PLAYER_ID) {
        updateActionDisplay(closestPlayer);
        showDirectionControls(closestPlayer);
    }
}

function activateBoost(player) {
    const vehicle = VEHICLES[player.vehicleId];
    const maxActionGauge = vehicle.maxActionGauge;
    const boostValue = 3; 

    if (player.actionGauge === 0) {
        player.actionGauge += boostValue;
    } else if (player.actionGauge < maxActionGauge) {
        const newGauge = player.actionGauge + boostValue;
        if (newGauge > maxActionGauge) {
            const excess = newGauge - maxActionGauge;
            player.actionGauge = maxActionGauge;
            for (let i = 0; i < excess; i++) {
                movePlayer(player);
            }
        } else {
            player.actionGauge = newGauge;
        }
    } else {
        for (let i = 0; i < boostValue; i++) {
            movePlayer(player);
        }
    }

    if (player.id === HUMAN_PLAYER_ID) {
        updateActionDisplay(player);
    }
}


function activateMine(player) {
    const { x: mineX, y: mineY } = getWallBehind(player);
    const wall = grid[mineY][mineX];

    if (wall.type !== 'wall' || wall.playerId !== player.id) {
        return false;
    }

    grid[mineY][mineX] = {
        type: 'mine',
        playerId: player.id,
        ownerId: player.id,
        active: false,
    };

    return true;
}

function updateMinesAfterMove(movedPlayer) {
    const mines = [];

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x].type === 'mine') {
                mines.push({ x, y });
            }
        }
    }

    let armedChange = false;

    for (const { x, y } of mines) {
        const mine = grid[y][x];
        const owner = players[mine.ownerId];

        if (!mine.active && owner && owner.alive) {
            const distToOwner = torusChebyshevDist(x, y, owner.x, owner.y);
            if (distToOwner > MINE_DETECTION_RANGE) {
                mine.active = true;
                armedChange = true;
            }
        }
    }

    for (const { x, y } of mines) {
        const mine = grid[y][x];
        if (!mine.active) continue;

        for (const p of players) {
            if (!p.alive) continue;
            const dist = torusChebyshevDist(x, y, p.x, p.y);
            if (dist <= MINE_DETECTION_RANGE) {
                explodeMine(x, y);
                return;
            }
        }
    }

    if (armedChange) {
        renderGrid();
    }
}

function explodeMine(mineX, mineY) {
    const mineOwnerId = grid[mineY][mineX].ownerId ?? grid[mineY][mineX].playerId;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (torusChebyshevDist(mineX, mineY, x, y) > MINE_EXPLOSION_RADIUS) continue;

            const cell = grid[y][x];
            if (cell.type === 'player') {
                eliminatePlayer(cell.playerId, mineOwnerId);
            }
            if (cell.type !== 'empty') {
                grid[y][x] = { type: 'empty', playerId: null };
            }
        }
    }

    renderGrid();
    if (!gameOver && players[HUMAN_PLAYER_ID].alive) {
        showDirectionControls(players[HUMAN_PLAYER_ID]);
    }
}






