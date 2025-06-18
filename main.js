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
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
            if (!cell) continue;

            // Reset classes et styles
            // à voir
            //cell.className = 'cell';
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
                cell.innerHTML = '<span class="crash-x">✖</span>';
            }
        }
    }
}

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
        actionGauge: 0,       // nombre d’actions de départ
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
        actionGauge: 0, 
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
        actionGauge: 0,     
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
        actionGauge: 0,  
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
        teleporter: true,
        boost: true,
        aerobrake: true,
    }),
    psionide: new Vehicle({
        id: 'Psio',
        nom: 'Psionide',
        maxActionGauge: 11,
        rechargeTime: 2000,
        latenceTourner: 2,
        shield: true,
        missile: false,
        jammer: true,
        aerobrake: true,
        boost: true,
    }),
    bison: new Vehicle({
        id: 'Bis',
        nom: 'Bison',
        maxActionGauge: 9,
        rechargeTime: 100,
        latenceTourner: 3,
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
        rechargeTime: 1000,
        latenceTourner: 2,
        shield: false,
        missile: false,
        teleporter: true,
        boost: true,
        aerobrake: true,
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
        playerCell.style.color = player.color;
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
showPowerControls(players[0]);

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
    const isSafe = grid[nextY][nextX].type === "empty";

    // Vérifier si la direction proposée ne fait pas reculer le joueur dans son propre mur
    if (!isSafe) {
        // Vérifier si la direction est opposée à la direction actuelle
        if ((direction === 'up' && player.dir === 'down') ||
            (direction === 'down' && player.dir === 'up') ||
            (direction === 'left' && player.dir === 'right') ||
            (direction === 'right' && player.dir === 'left')) {
            return false;
        }
    }

    return isSafe;
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

function showPowerControls(player) {
    const powerControls = document.getElementById('power-controls');
    powerControls.innerHTML = ''; // Efface les anciens contrôles de pouvoir

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
            btn.onclick = () => {
                activatePower(player, power.key);
                showPowerControls(player); // Mettre à jour les boutons après activation
            };

            // Vérifier si le pouvoir est disponible
            if (!vehicle[power.key]) {
                btn.disabled = true;
                btn.classList.add('disabled-power');
            }

            powerControls.appendChild(btn);
        }
    });
}


function activatePower(player, powerKey) {
    const vehicle = VEHICLES[player.vehicleId];

    // Vérifier si le pouvoir est disponible
    if (!vehicle[powerKey]) {
        console.log("Ce pouvoir n'est pas disponible.");
        return;
    }

    // Activer le pouvoir
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

    // Mettre à jour l'attribut du véhicule pour indiquer que le pouvoir a été utilisé
    vehicle[powerKey] = false;

    // Mettre à jour l'affichage
    renderGrid();
    updateActionDisplay(player);
    //showPowerControls(player);
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
    showDirectionControls(player); // Recalculer les contrôles de direction
}

//function activateMissile(player) {
//    let x = player.x;
//    let y = player.y;
//    let dx = 0;
//    let dy = 0;

//    // Déterminer la direction du missile
//    if (player.dir === 'up') dy = -1;
//    if (player.dir === 'down') dy = 1;
//    if (player.dir === 'left') dx = -1;
//    if (player.dir === 'right') dx = 1;

//    // Déterminer la classe CSS en fonction de la direction
//    const trailClass = (dx !== 0) ? 'missile-trail-horizontal' : 'missile-trail-vertical';

//    // Parcourir jusqu'à 4 cases dans la direction du missile
//    for (let i = 0; i < 4; i++) {
//        x = (x + dx + gridSize) % gridSize;
//        y = (y + dy + gridSize) % gridSize;

//        // Appliquer un effet visuel temporaire
//        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
//        if (cell) {
//            cell.classList.add(trailClass);

//            // Supprimer la classe après un court délai pour l'effet visuel
//            setTimeout(() => {
//                cell.classList.remove(trailClass);
//            }, 300);
//        }

//        // Vérifier si la case contient un mur ou un joueur
//        if (grid[y][x].type === 'wall' || grid[y][x].type === 'player') {
//            const target = grid[y][x];
//            if (target.type === 'player') {
//                const targetPlayer = players[target.playerId];
//                if (!targetPlayer.shieldActive) {
//                    targetPlayer.alive = false;
//                    setTimeout(() => {
//                        alert(`Le joueur ${targetPlayer.id} est éliminé !`);
//                    }, 100);
//                } else {
//                    console.log(`Le joueur ${targetPlayer.id} est protégé par un bouclier !`);
//                }
//            }
//            // Détruire la case rencontrée si c'est un mur
//            if (target.type === 'wall') {
//                grid[y][x] = { type: "empty", playerId: null };
//                if (cell) {
//                    cell.className = 'cell';
//                    cell.style.background = '#F2F2F2';
//                    cell.style.boxShadow = '';
//                }
//            }
//            break;
//        }
//    }
//    renderGrid(); // Mettre à jour l'affichage de la grille
//}

function activateMissile(player) {
    let x = player.x;
    let y = player.y;
    let dx = 0;
    let dy = 0;

    // Déterminer la direction du missile
    if (player.dir === 'up') dy = -1;
    if (player.dir === 'down') dy = 1;
    if (player.dir === 'left') dx = -1;
    if (player.dir === 'right') dx = 1;

    // Parcourir jusqu'à 4 cases dans la direction du missile
    for (let i = 0; i < 4; i++) {
        x = (x + dx + gridSize) % gridSize;
        y = (y + dy + gridSize) % gridSize;

        // Appliquer un effet visuel temporaire
        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (cell) {
            const trailClass = (dx !== 0) ? 'missile-trail-horizontal' : 'missile-trail-vertical';
            cell.classList.add(trailClass);
            setTimeout(() => {
                cell.classList.remove(trailClass);
            }, 300);
        }

        // Vérifier si la case contient un mur ou un joueur
        if (grid[y][x].type === 'wall' || grid[y][x].type === 'player') {
            const target = grid[y][x];
            if (target.type === 'player') {
                const targetPlayer = players[target.playerId];
                if (!targetPlayer.shieldActive) {
                    targetPlayer.alive = false;
                    // Retirer le joueur de la grille
                    grid[y][x] = { type: "empty", playerId: null };
                    if (cell) {
                        cell.className = 'cell';
                        cell.style.background = '#F2F2F2';
                        cell.style.boxShadow = '';
                    }
                    setTimeout(() => {
                        alert(`Le joueur ${targetPlayer.id} est éliminé !`);
                    }, 100);
                } else {
                    console.log(`Le joueur ${targetPlayer.id} est protégé par un bouclier !`);
                }
            } else if (target.type === 'wall') {
                // Détruire le mur
                grid[y][x] = { type: "empty", playerId: null };
                if (cell) {
                    cell.className = 'cell';
                    cell.style.background = '#F2F2F2';
                    cell.style.boxShadow = '';
                }
            }
            break;
        }
    }
    renderGrid(); // Mettre à jour l'affichage de la grille
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





