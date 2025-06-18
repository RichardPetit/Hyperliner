// main.js
const gridSize = 22;
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
    // Parcours toutes les cases et met à jour le DOM
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
            if (!cell) continue;

            // Reset classes et styles
            cell.className = 'cell';
            cell.style.background = '';
            cell.style.boxShadow = '';

            const cellState = grid[y][x];
            if (cellState.type === 'player') {
                const player = players[cellState.playerId];
                cell.classList.add('player');
                cell.style.background = player.color;
                cell.style.color = player.color;
                cell.style.boxShadow = `
          0 0 8px #fff,
          0 0 16px ${player.shadowColor},
          0 0 32px ${player.shadowColor},
          0 0 48px ${player.shadowColor}
        `;
            } else if (cellState.type === 'wall') {
                const player = players[cellState.playerId];
                cell.classList.add('wall');
                cell.style.background = '#888'; // gris
                cell.style.boxShadow = `0 0 6px 2px ${player.color}`;
            } else if (cellState.type === 'crash') {
                cell.classList.add('crash');
                cell.style.background = '#e53935'; // rouge vif
                cell.innerHTML = '<span class="crash-x">✖</span>'; // croix blanche
            }
        }
    }
}


// Tableau des joueurs : position x/y et direction initiale
//const players = [
//    // Bas (vers le haut)
//    { x: 7, y: 17, dir: 'up', color: "#7FFFD4"/*, shadowColor: "#FF6F91"*/ },   // Aqua + rose
//    { x: 14, y: 17, dir: 'up', color: "#FF69B4"/*, shadowColor: "#00FFD0" */},  // Rose + turquoise
//    // Haut (vers le bas)
//    { x: 7, y: 4, dir: 'down', color: "#FFD700"/*, shadowColor: "#00BFFF"*/ },  // Jaune + bleu
//    { x: 14, y: 4, dir: 'down', color: "#00BFFF"/*, shadowColor: "#FFD700"*/ }, // Bleu + jaune
//    // Gauche (vers la droite)
//    { x: 4, y: 7, dir: 'right', color: "#FF6347"/*, shadowColor: "#32CD32"*/ }, // Rouge + vert
//    { x: 4, y: 14, dir: 'right', color: "#32CD32"/*, shadowColor: "#FF6347"*/ },// Vert + rouge
//    // Droite (vers la gauche)
//    { x: 17, y: 7, dir: 'left', color: "#FFA500"/*, shadowColor: "#007BFF"*/ }, // Orange + bleu foncé
//    { x: 17, y: 14, dir: 'left', color: "#BA55D3"/*, shadowColor: "#FFD700"*/ } // Violet + jaune
//];
const players = [
    // Bas (vers le haut)
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
        actionGauge: 0,             // nombre d’actions stockées actuellement
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
        vehicleId: 'psionide',
        actionGauge: 0,             // nombre d’actions stockées actuellement
        lastActionTime: Date.now()
    },
    // Haut (vers le bas)
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
        actionGauge: 0,             // nombre d’actions stockées actuellement
        lastActionTime: Date.now()
    },
    {
        id: 3,
        x:14,
        y: 4,
        dir: 'down',
        latence: 0,
        color: "#00BFFF",
        alive: true,
        score: 0,
        vehicleId: 'psionide',
        actionGauge: 0,             // nombre d’actions stockées actuellement
        lastActionTime: Date.now()
    },
    // Gauche (vers la droite)
    {
        id: 4,
        x: 4,
        y: 7,
        dir: 'right',
        latence: 0,
        color: "#FF6347",
        alive: true,
        score: 0,
        vehicleId: 'psionide',
        actionGauge: 0,             // nombre d’actions stockées actuellement
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
        vehicleId: 'psionide',
        actionGauge: 0,             // nombre d’actions stockées actuellement
        lastActionTime: Date.now()
    },
    // Droite (vers la gauche)
    {
        id: 6,
        x: 17,
        y: 7,
        dir: 'left',
        latence: 0,
        color: "#BA55D3",
        alive: true,
        score: 0,
        vehicleId: 'psionide',
        actionGauge: 0,             // nombre d’actions stockées actuellement
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
        actionGauge: 0,             // nombre d’actions stockées actuellement
        lastActionTime: Date.now()
    },
];
//players.forEach(player => {
//    const vehicle = VEHICLES[player.vehicleId];
//    // Pour chaque propriété de bonus/pouvoir du véhicule, on la copie sur le joueur
//    player.shieldActive = vehicle.shield ? true : false;
//    player.teleporter = vehicle.teleporter ? true : false;
//    player.jammer = vehicle.jammer ? true : false;
//    player.mine = vehicle.mine ? true : false;
//    player.boost = vehicle.boost ? true : false;
//    player.aerobrake = vehicle.aerobrake ? true : false;
//    player.missile = vehicle.missile ? true : false;
//});






/*PARTIE VEHICULES ET BONUS*/
//players.forEach(player => {
//    // Si le véhicule a un bouclier, shieldActive est true, sinon false
//    player.shieldActive = VEHICLES[player.vehicleId].shield ? true : false;
//});

class Vehicle {
    constructor(options) {
        this.id = options.id;
        this.nom = options.nom;
        this.maxActionGauge = options.maxActionGauge;
        this.rechargeTime = options.rechargeTime;
        this.latenceTourner = options.latenceTourner;
        // Bonus et pouvoirs
        this.shield = options.shield || false;
        this.teleporter = options.teleporter || false;
        this.jammer = options.jammer || false;
        this.mine = options.mine || false;
        this.boost = options.boost || false;
        this.aerobrake = options.aerobrake || false;
        this.missile = options.missile || false;
    }
}

const VEHICLES = {
    snypase: new Vehicle({
        id: 'Sny',
        nom: 'Snypase',
        maxActionGauge: 6,
        rechargeTime: 1200,
        latenceTourner: 4,
        shield: false,
        missile: true,
    }),
    psionide: new Vehicle({
        id: 'Psio',
        nom: 'Psionide',
        maxActionGauge: 11,
        rechargeTime: 2000,
        latenceTourner: 2,
        shield: true,
        missile: false,
    }),
    bison: new Vehicle({
        id: 'Bis',
        nom: 'Bison',
        maxActionGauge: 8,
        rechargeTime: 1200,
        latenceTourner: 2,
        shield: true,
        missile: false,
    }),
    vulture: new Vehicle({
        id: 'Vul',
        nom: 'Vulture',
        maxActionGauge: 8,
        rechargeTime: 1200,
        latenceTourner: 2,
        shield: true,
        missile: false,
    }),
    kortex: new Vehicle({
        id: 'Kor',
        nom: 'Kortex',
        maxActionGauge: 8,
        rechargeTime: 1200,
        latenceTourner: 2,
        shield: true,
        missile: false,
    }),
    banshee: new Vehicle({
        id: 'Ban',
        nom: 'Banshee',
        maxActionGauge: 8,
        rechargeTime: 1200,
        latenceTourner: 2,
        shield: true,
        missile: false,
    }),
    mighty: new Vehicle({
        id: 'Mig',
        nom: 'Mighty',
        maxActionGauge: 8,
        rechargeTime: 1200,
        latenceTourner: 2,
        shield: true,
        missile: false,
    }),
    duck: new Vehicle({
        id: 'Duc',
        nom: 'Duck',
        maxActionGauge: 8,
        rechargeTime: 1200,
        latenceTourner: 2,
        shield: true,
        missile: false,
    }),
}
//const vehicle = VEHICLES[player.vehicleId];


const bonusKeys = [
    'shield', 'teleporter', 'jammer', 'mine', 'boost', 'aerobrake', 'missile'
];

players.forEach(player => {
    const vehicle = VEHICLES[player.vehicleId];
    bonusKeys.forEach(key => {
        // Possession du pouvoir
        player[key] = !!vehicle[key];
        // Etat actif du pouvoir (initialisé à true si possédé, sinon false)
        player[`${key}Active`] = !!vehicle[key];
    });
});

/* fin partie véhicules et bonus */






// Place les joueurs et leur mur de départ
players.forEach(player => {
    // Place le joueur
    const playerCell = document.querySelector(
        `.cell[data-x="${player.x}"][data-y="${player.y}"]`
    );
    if (playerCell) {
        playerCell.classList.add('player');
        playerCell.style.background = player.color;
        playerCell.style.color = player.color; // Pour currentColor
        playerCell.style.boxShadow = `
      0 0 8px #fff,
      0 0 16px ${player.shadowColor},
      0 0 32px ${player.shadowColor},
      0 0 48px ${player.shadowColor}
    `;
    }

    // Place le mur derrière
    let wallX = player.x, wallY = player.y;
    if (player.dir === 'up') wallY = (player.y + 1) % 22;
    if (player.dir === 'down') wallY = (player.y - 1 + 22) % 22;
    if (player.dir === 'left') wallX = (player.x + 1) % 22;
    if (player.dir === 'right') wallX = (player.x - 1 + 22) % 22;

    const wallCell = document.querySelector(
        `.cell[data-x="${wallX}"][data-y="${wallY}"]`
    );
    if (wallCell) {
        wallCell.classList.add('wall');
        wallCell.style.boxShadow = wallShadow(player.color);
    }
});

let grid = [];
for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
        grid[y][x] = {
            type: "empty",    // "empty", "wall", ou "player"
            playerId: null    // id du joueur si la case est occupée
        };
    }
}
updateActionDisplay(players[0]);



players.forEach(player => {
    // Place le joueur sur la grille
    grid[player.y][player.x] = { type: "player", playerId: player.id };

    // Place le mur derrière le joueur
    let wallX = player.x, wallY = player.y;
    if (player.dir === 'up') wallY = (player.y + 1) % gridSize;
    if (player.dir === 'down') wallY = (player.y - 1 + gridSize) % gridSize;
    if (player.dir === 'left') wallX = (player.x + 1) % gridSize;
    if (player.dir === 'right') wallX = (player.x - 1 + gridSize) % gridSize;

    grid[wallY][wallX] = { type: "wall", playerId: player.id };
});
// Supposons que tu veux contrôler le premier joueur (index 0)
showDirectionControls(players[0]);

function showDirectionControls(player) {
    const controls = document.getElementById('controls');
    controls.innerHTML = ''; // Efface les anciens contrôles

    // Directions possibles basées sur la direction actuelle
    let possibleDirections = [];
    if (player.latence > 0) {
        // Seule la direction actuelle est possible
        possibleDirections.push(player.dir);
    } else {
        // Peut tourner à gauche, à droite, ou continuer tout droit
        if (player.dir === 'up' || player.dir === 'down') {
            possibleDirections = ['left', player.dir, 'right'];
        } else {
            possibleDirections = ['up', player.dir, 'down'];
        }
    }

    // Filtrer les directions sûres
    const safeDirections = possibleDirections.filter(dir => isDirectionSafe(player, dir));

    // Créer un bouton pour chaque direction sûre
    safeDirections.forEach(direction => {
        const btn = document.createElement('button');
        btn.className = 'arrow-btn arrow-' + direction;
        btn.innerHTML = getArrowSymbol(direction);
        btn.onclick = () => handleDirectionClick(direction);
        controls.appendChild(btn);
    });
}

function isDirectionSafe(player, direction) {
    let nextX = player.x;
    let nextY = player.y;

    // Calculer la prochaine position en fonction de la direction
    if (direction === 'up') nextY = (player.y - 1 + gridSize) % gridSize;
    if (direction === 'down') nextY = (player.y + 1) % gridSize;
    if (direction === 'left') nextX = (player.x - 1 + gridSize) % gridSize;
    if (direction === 'right') nextX = (player.x + 1) % gridSize;

    // Vérifier si la prochaine case est sûre (vide)
    return grid[nextY][nextX].type === "empty";
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


//function movePlayer(player) {
//    // Calcul de la nouvelle position avec wrap-around
//    let nextX = player.x, nextY = player.y;
//    if (player.dir === 'up') nextY = (player.y - 1 + gridSize) % gridSize;
//    if (player.dir === 'down') nextY = (player.y + 1) % gridSize;
//    if (player.dir === 'left') nextX = (player.x - 1 + gridSize) % gridSize;
//    if (player.dir === 'right') nextX = (player.x + 1) % gridSize;

//    // Si collision
//    if (grid[nextY][nextX].type !== "empty") {
//        // Transforme la case quittée en mur AVANT de traiter la collision
//        grid[player.y][player.x] = { type: "wall", playerId: player.id };

//        // Si c'est un autre joueur, on l'élimine aussi
//        if (grid[nextY][nextX].type === "player") {
//            const otherId = grid[nextY][nextX].playerId;
//            players[otherId].alive = false;
//            player.score++;
//        }
//        // Marque la case d'arrivée comme "crash"
//        grid[nextY][nextX] = { type: "crash", playerId: player.id };
//        player.alive = false;
//        renderGrid();
//        setTimeout(() => {
//            alert("Le joueur est éliminé !");
//        }, 100);
//        return;
//    }

//    // Si pas de collision, la case quittée devient un mur
//    grid[player.y][player.x] = { type: "wall", playerId: player.id };

//    // Déplacement du joueur
//    player.x = nextX;
//    player.y = nextY;
//    grid[player.y][player.x] = { type: "player", playerId: player.id };

//    // Gère la latence
//    if (player.latence > 0) player.latence--;
//}
function movePlayer(player) {
    // Calculer la nouvelle position avec wrap-around
    let nextX = player.x;
    let nextY = player.y;
    if (player.dir === 'up') nextY = (player.y - 1 + gridSize) % gridSize;
    if (player.dir === 'down') nextY = (player.y + 1) % gridSize;
    if (player.dir === 'left') nextX = (player.x - 1 + gridSize) % gridSize;
    if (player.dir === 'right') nextX = (player.x + 1) % gridSize;

    // Vérifier les collisions
    if (grid[nextY][nextX].type !== "empty") {
        // Si collision avec un mur, un joueur ou une case de crash
        if (grid[nextY][nextX].type === "wall" || grid[nextY][nextX].type === "player" || grid[nextY][nextX].type === "crash") {
            // Marquer la case actuelle comme un mur
            grid[player.y][player.x] = { type: "wall", playerId: player.id };

            // Si collision avec un autre joueur, éliminer cet autre joueur
            if (grid[nextY][nextX].type === "player") {
                const otherPlayerId = grid[nextY][nextX].playerId;
                players[otherPlayerId].alive = false;
            }

            // Marquer la case de collision comme un crash et éliminer le joueur actuel
            grid[nextY][nextX] = { type: "crash", playerId: player.id };
            player.alive = false;

            renderGrid();
            setTimeout(() => {
                alert("Le joueur est éliminé !");
            }, 100);
            return;
        }
    }

    // Si pas de collision, la case quittée devient un mur
    grid[player.y][player.x] = { type: "wall", playerId: player.id };

    // Déplacer le joueur
    player.x = nextX;
    player.y = nextY;
    grid[player.y][player.x] = { type: "player", playerId: player.id };

    // Gérer la latence
    if (player.latence > 0) player.latence--;
}




function rechargeActions() {
    const now = Date.now();
    players.forEach(player => {
        const vehicle = VEHICLES[player.vehicleId];
        if (!player.alive) return;

        // Si la jauge n'est pas pleine, on recharge normalement
        if (player.actionGauge < vehicle.maxActionGauge &&
            now - player.lastActionTime >= vehicle.rechargeTime) {
            player.actionGauge++;
            player.lastActionTime = now;
            updateActionDisplay(player);
        }
        // Si la jauge est pleine et qu'une recharge aurait dû avoir lieu
        else if (player.actionGauge >= vehicle.maxActionGauge &&
            now - player.lastActionTime >= vehicle.rechargeTime) {
            // Avance automatiquement tout droit
            movePlayer(player);
            player.lastActionTime = now;
            renderGrid();
            showDirectionControls(player);
            updateActionDisplay(player);
        }
    });
}



setInterval(rechargeActions, 100);

function handleDirectionClick(direction) {
    let player = players[0];
    const vehicle = VEHICLES[player.vehicleId];

    if (player.actionGauge <= 0) return;

    // On ne décrémente la latence que si elle est active et qu'on va tout droit
    if (player.latence > 0 && direction === player.dir) {
        player.latence--;
    }

    // Après décrémentation, si latence > 0, on ne peut que continuer tout droit
    if (player.latence > 0 && direction !== player.dir) return;

    // Si on tourne, on applique la latence du véhicule
    if (direction !== player.dir) {
        player.dir = direction;
        player.latence = vehicle.latenceTourner;
    }

    player.actionGauge--;
    movePlayer(player);
    renderGrid();
    showDirectionControls(player);
    updateActionDisplay(player);
}


function updateActionDisplay(player) {
    const gauge = document.getElementById('action-gauge');
    const vehicle = VEHICLES[player.vehicleId];

    // Jauge d'accélération (verticale)
    let html = '<div><b>Actions</b><br>';
    for (let i = vehicle.maxActionGauge; i > 0; i--) {
        html += `<div style="width:28px;height:18px; background:${i <= player.actionGauge ? '#0af' : '#eee'}; border-radius:4px; margin:2px auto"></div>`;
    }
    html += '</div>';

    // Jauge de latence (verticale, uniquement si latence > 0)
    if (player.latence > 0) {
        html += '<div style="margin-top:20px"><b>Latence</b><br>';
        for (let i = player.latence; i > 0; i--) {
            html += `<div style="width:28px;height:18px; background:#f66; border-radius:4px; margin:2px auto"></div>`;
        }
        html += '</div>';
    }

    gauge.innerHTML = html;
}



function showPowers(player) {
    const powersDiv = document.getElementById('powers');
    powersDiv.innerHTML = ''; // Vide les anciens pouvoirs
    const vehicle = VEHICLES[player.vehicleId];

    // Liste des pouvoirs à afficher
    const powersList = [
        { key: 'shield', label: 'Bouclier' },
        { key: 'teleporter', label: 'Téléporteur' },
        { key: 'jammer', label: 'Brouilleur' },
        { key: 'mine', label: 'Mine' },
        { key: 'boost', label: 'Boost' },
        { key: 'aerobrake', label: 'Aérofrein' },
        { key: 'missile', label: 'Missile' }
    ];

    powersList.forEach(power => {
        if (vehicle[power.key]) {
            const btn = document.createElement('button');
            btn.textContent = power.label;
            btn.onclick = () => activatePower(player, power.key);
            powersDiv.appendChild(btn);
        }
    });
}


function activatePower(player, powerKey) {
    switch (powerKey) {
        case 'shield':
            activateShield(player);
            break;
        case 'teleporter':
            activateTeleporter(player);
            break;
        case 'jammer':
            activateJammer(player);
            break;
        case 'mine':
            activateMine(player);
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
    renderGrid();
    updateActionDisplay(player);
    showPowers(player);
}

function activatePower(player, powerKey) {
    switch (powerKey) {
        case 'shield':
            activateShield(player);
            break;
        case 'teleporter':
            activateTeleporter(player);
            break;
        case 'jammer':
            activateJammer(player);
            break;
        case 'mine':
            activateMine(player);
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
    renderGrid();
    updateActionDisplay(player);
    showPowers(player);
}

//Bouclier temporaire
//function activateShield(player) {
//    player.shieldActive = true;
//    setTimeout(() => {
//        player.shieldActive = false;
//        updateActionDisplay(player);
//    }, 5000); // Bouclier actif pendant 5 secondes
//}
//ou Bouclier permanent
function activateShield(player) {
    player.shieldActive = true;
}

function activateAerobrake(player) {
    player.latence = 0;
    player.actionGauge = 0;
    updateActionDisplay(player);
}

function activateMissile(player) {
    // Tire un missile dans la direction du joueur
    let x = player.x, y = player.y;
    let dx = 0, dy = 0;
    if (player.dir === 'up') dy = -1;
    if (player.dir === 'down') dy = 1;
    if (player.dir === 'left') dx = -1;
    if (player.dir === 'right') dx = 1;

    // Parcours jusqu'à toucher un mur ou un autre joueur
    //while (true) {
    //portée de 4 cases
    for (let i = 0; i < 4; i++) {
        x += dx;
        y += dy;
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) break;
        if (grid[y][x].type === 'wall' || grid[y][x].type === 'player') {
            //// Explosion ou effet
            //grid[y][x] = { type: "crash", playerId: player.id };
            //break;
            //}
            if (grid[y][x].type === 'player') {
                const otherId = grid[y][x].playerId;
                players[otherId].alive = false;
            }
            grid[y][x] = { type: "empty", playerId: null };
        }
    }
    renderGrid();
}

function activateTeleporter(player) {
    // Trouver une position aléatoire vide sur la grille
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * gridSize);
        newY = Math.floor(Math.random() * gridSize);
    } while (grid[newY][newX].type !== "empty");

    // Déplacer le joueur à la nouvelle position
    grid[player.y][player.x] = { type: "empty", playerId: null };
    player.x = newX;
    player.y = newY;
    grid[player.y][player.x] = { type: "player", playerId: player.id };
}

function activateJammer(player) {
    let closestPlayer = null;
    let minDistance = Infinity;

    players.forEach(p => {
        if (p.id !== player.id && p.alive) {
            const distance = Math.sqrt(Math.pow(p.x - player.x, 2) + Math.pow(p.y - player.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestPlayer = p;
            }
        }
    });

    if (closestPlayer) {
        closestPlayer.latence = 3;
    }
}

function activateBoost(player) {
    const vehicle = VEHICLES[player.vehicleId];
    const maxActionGauge = vehicle.maxActionGauge;
    const boostValue = 3; // Le boost donne 3 actions

    if (player.actionGauge === 0) {
        // Si la jauge est vide, augmenter de la valeur du boost
        player.actionGauge += boostValue;
    } else if (player.actionGauge < maxActionGauge) {
        // Si la jauge n'est pas pleine, augmenter de la valeur du boost et gérer l'excédent
        const newGauge = player.actionGauge + boostValue;
        if (newGauge > maxActionGauge) {
            const excess = newGauge - maxActionGauge;
            player.actionGauge = maxActionGauge;
            // Avancer automatiquement du nombre de cases correspondant à l'excédent
            for (let i = 0; i < excess; i++) {
                movePlayer(player);
            }
        } else {
            player.actionGauge = newGauge;
        }
    } else {
        // Si la jauge est pleine, avancer automatiquement du nombre de cases correspondant au boost
        for (let i = 0; i < boostValue; i++) {
            movePlayer(player);
        }
    }

    updateActionDisplay(player);
    renderGrid();
}


function activateMine(player) {
    const mineX = player.x;
    const mineY = player.y;

    // Marquer la case avec une mine inactive
    grid[mineY][mineX] = { type: "mine", playerId: player.id, active: false };

    // Activer la mine après que le joueur ait quitté la zone
    setTimeout(() => {
        if (grid[mineY][mineX].type === "mine" && !grid[mineY][mineX].active) {
            grid[mineY][mineX].active = true;
            renderGrid(); // Assurez-vous de mettre à jour l'affichage
        }
    }, 5000); // Attendre que le joueur soit hors de portée
}

function checkMineExplosion(x, y) {
    for (let i = Math.max(0, x - 2); i <= Math.min(gridSize - 1, x + 2); i++) {
        for (let j = Math.max(0, y - 2); j <= Math.min(gridSize - 1, y + 2); j++) {
            if (grid[j][i].type === "mine" && grid[j][i].active) {
                explodeMine(i, j);
                return;
            }
        }
    }
}

function explodeMine(x, y) {
    for (let i = Math.max(0, x - 4); i <= Math.min(gridSize - 1, x + 4); i++) {
        for (let j = Math.max(0, y - 4); j <= Math.min(gridSize - 1, y + 4); j++) {
            if (grid[j][i].type === "player") {
                const playerId = grid[j][i].playerId;
                players[playerId].alive = false;
            }
            grid[j][i] = { type: "empty", playerId: null };
        }
    }
    renderGrid();
}





