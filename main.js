// main.js
const gridSize = 22;
const HUMAN_PLAYER_ID = 0;
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
                if (player.shield) cell.classList.add('shield-active');
                cell.dataset.dir = player.dir;
                cell.style.background = player.color;
                cell.innerHTML = `<span class="vehicle-badge">${vehicle.id}</span>`;
                cell.style.boxShadow = `
          0 0 8px #fff,
          0 0 16px ${player.color},
          0 0 32px ${player.color}
        `;
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
          <div class="roster-entry${isHuman ? ' roster-human' : ''}">
            <span class="roster-dot" style="background:${player.color}"></span>
            <span class="roster-vehicle">${vehicle.nom} <span class="roster-code">${vehicle.id}</span></span>
            ${isHuman ? '<span class="roster-you">(vous)</span>' : ''}
            <div class="roster-powers">${powers || 'Aucun pouvoir'}</div>
          </div>`;
    });
    roster.innerHTML = html;
}

let selectedVehicleId = 'snypase';
let gameStarted = false;

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

    setHumanVehicle(selectedVehicleId);

    const now = Date.now();
    players[HUMAN_PLAYER_ID].lastActionTime = now;
    players.forEach(player => {
        if (player.id !== HUMAN_PLAYER_ID) {
            player.lastActionTime = now + player.id * 250;
        }
    });

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

players.forEach(player => initPlayerPowers(player));

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

players.forEach(player => {
    grid[player.y][player.x] = { type: "player", playerId: player.id };

    let wallX = player.x, wallY = player.y;
    if (player.dir === 'up') wallY = (player.y + 1) % gridSize;
    if (player.dir === 'down') wallY = (player.y - 1 + gridSize) % gridSize;
    if (player.dir === 'left') wallX = (player.x + 1) % gridSize;
    if (player.dir === 'right') wallX = (player.x - 1 + gridSize) % gridSize;

    grid[wallY][wallX] = { type: "wall", playerId: player.id };
});

initSetupScreen();
renderGrid();
renderVehicleRoster();

function showDirectionControls(player) {
    const controls = document.getElementById('controls');
    controls.innerHTML = '';

    const possibleDirections = getPossibleDirections(player);
    const safeDirections = possibleDirections.filter(dir => isDirectionSafe(player, dir));

    safeDirections.forEach(direction => {
        const btn = document.createElement('button');
        btn.className = 'arrow-btn arrow-' + direction;
        btn.innerHTML = getArrowSymbol(direction);
        btn.onclick = () => handleDirectionClick(direction);
        controls.appendChild(btn);
    });
}

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
    const vehicle = VEHICLES[player.vehicleId];
    const direction = chooseBotDirection(player);

    if (direction !== player.dir && player.latence === 0) {
        player.dir = direction;
        player.latence = vehicle.latenceTourner;
    }

    movePlayer(player);
}

function maybeBotAct(player) {
    const vehicle = VEHICLES[player.vehicleId];
    if (player.actionGauge <= 0) return;

    const straightSafe = isDirectionSafe(player, player.dir);

    if (!straightSafe) {
        executePlayerMove(player, chooseBotDirection(player));
        return;
    }

    if (player.actionGauge >= vehicle.maxActionGauge - 1) {
        executePlayerMove(player, chooseBotDirection(player));
        return;
    }

    const bestDir = chooseBotDirection(player);
    const straightSpace = countOpenSpace(player.x, player.y, player.dir);
    if (bestDir !== player.dir && player.latence === 0 && straightSpace <= 3) {
        executePlayerMove(player, bestDir);
        return;
    }

    if (Math.random() < 0.04 && player.actionGauge > 2) {
        executePlayerMove(player, chooseBotDirection(player));
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
            grid[player.y][player.x] = { type: "wall", playerId: player.id };

            if (targetType === "player") {
                const otherPlayerId = grid[nextY][nextX].playerId;
                players[otherPlayerId].alive = false;
            }

            grid[nextY][nextX] = { type: "crash", playerId: player.id };
            player.alive = false;

            renderGrid();
            if (player.id === HUMAN_PLAYER_ID) {
                setTimeout(() => {
                    alert("Le joueur est éliminé !");
                }, 100);
            }
            renderVehicleRoster();
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
    if (!gameStarted) return;

    const now = Date.now();
    let needsRender = false;
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
                updateActionDisplay(player);
            } else {
                maybeBotAct(player);
                needsRender = true;
            }
            return;
        }

        if (player.actionGauge >= vehicle.maxActionGauge &&
            now - player.lastActionTime >= vehicle.rechargeTime) {
            if (isHuman) {
                movePlayer(player);
                showDirectionControls(player);
                updateActionDisplay(player);
            } else {
                botAutoMove(player);
            }
            player.lastActionTime = now;
            needsRender = true;
        }
    });

    if (needsRender) {
        renderGrid();
        if (human.alive) showDirectionControls(human);
    }
}



setInterval(rechargeActions, 100);

function handleDirectionClick(direction) {
    if (!gameStarted) return;
    const player = players[HUMAN_PLAYER_ID];
    if (executePlayerMove(player, direction)) {
        renderGrid();
        showDirectionControls(player);
        updateActionDisplay(player);
    }
}


function updateActionDisplay(player) {
    const gauge = document.getElementById('action-gauge');
    const vehicle = VEHICLES[player.vehicleId];

    let html = `<div class="vehicle-panel-name">${vehicle.nom} <span class="roster-code">${vehicle.id}</span></div>`;
    html += `<div class="vehicle-panel-powers">${getPlayerPowersSummary(player)}</div>`;

    html += '<div style="margin-top:12px"><b>Actions</b><br>';
    for (let i = vehicle.maxActionGauge; i > 0; i--) {
        html += `<div style="width:28px;height:18px; background:${i <= player.actionGauge ? '#0af' : '#eee'}; border-radius:4px; margin:2px auto"></div>`;
    }
    html += '</div>';

    if (player.latence > 0) {
        html += '<div style="margin-top:20px"><b>Latence</b><br>';
        for (let i = player.latence; i > 0; i--) {
            html += `<div style="width:28px;height:18px; background:#f66; border-radius:4px; margin:2px auto"></div>`;
        }
        html += '</div>';
    }

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
    if (!gameStarted) return;
    if (!player[powerKey] || player[`${powerKey}Used`]) return;

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
    }

    if (!success) return;

    player[`${powerKey}Used`] = true;

    renderGrid();
    updateActionDisplay(player);
    if (player.id === HUMAN_PLAYER_ID) {
        showDirectionControls(player);
        showPowerControls(player);
    }
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
                    targetPlayer.alive = false;
                    grid[y][x] = { type: "crash", playerId: null };
                    if (targetPlayer.id === HUMAN_PLAYER_ID) {
                        setTimeout(() => alert("Le joueur est éliminé !"), 100);
                    }
                } else {
                    consumeShield(targetPlayer);
                }
            } else {
                grid[y][x] = { type: "empty", playerId: null };
            }
            break;
        }
    }

    renderGrid();
    renderVehicleRoster();
    playMissileTrail(trailPath, dx);
}

function activateAerobrake(player) {
    player.latence = 0;
    player.actionGauge = 0;
    updateActionDisplay(player);
    showDirectionControls(player);
}


function activateTeleporter(player) {
    // Trouver une position aléatoire vide sur la grille
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * gridSize);
        newY = Math.floor(Math.random() * gridSize);
    } while (grid[newY][newX].type !== "empty");

    // Réinitialiser l'ancien emplacement du joueur
    const oldCell = document.querySelector(`.cell[data-x="${player.x}"][data-y="${player.y}"]`);
    if (oldCell) {
        oldCell.className = 'cell';
        oldCell.style.background = '#F2F2F2';
        oldCell.style.boxShadow = '';
    }

    // Mettre à jour la grille pour l'ancien emplacement
    grid[player.y][player.x] = { type: "empty", playerId: null };

    // Déplacer le joueur à la nouvelle position
    player.x = newX;
    player.y = newY;
    grid[player.y][player.x] = { type: "player", playerId: player.id };

    // Mettre à jour les contrôles de direction
    showDirectionControls(player);
    updateMinesAfterMove(player);
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

    updateActionDisplay(player);
    renderGrid();
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
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (torusChebyshevDist(mineX, mineY, x, y) > MINE_EXPLOSION_RADIUS) continue;

            const cell = grid[y][x];
            if (cell.type === 'player') {
                const victim = players[cell.playerId];
                victim.alive = false;
                if (victim.id === HUMAN_PLAYER_ID) {
                    setTimeout(() => alert("Le joueur est éliminé !"), 100);
                }
            }
            if (cell.type !== 'empty') {
                grid[y][x] = { type: 'empty', playerId: null };
            }
        }
    }

    renderGrid();
    renderVehicleRoster();
    if (players[HUMAN_PLAYER_ID].alive) {
        showDirectionControls(players[HUMAN_PLAYER_ID]);
    }
}






