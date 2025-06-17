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
    controls.innerHTML = ''; // Vide les anciens contrôles

    // Détermine les directions possibles
    const possibleDirections = [];
    if (player.latence > 0) {
        // Seule la direction actuelle est possible
        possibleDirections.push(player.dir);
    } else {
        // Peut tourner à gauche, à droite, ou continuer tout droit
        if (player.dir === 'up' || player.dir === 'down') {
            possibleDirections.push('left', player.dir, 'right');
        } else {
            possibleDirections.push('up', player.dir, 'down');
        }
    }

    // Pour chaque direction possible, crée un bouton/flèche
    possibleDirections.forEach(direction => {
        const btn = document.createElement('button');
        btn.className = 'arrow-btn arrow-' + direction;
        btn.innerHTML = getArrowSymbol(direction); // Fonction à créer pour le symbole
        btn.onclick = () => handleDirectionClick(direction);
        controls.appendChild(btn);
    });
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


//function handleDirectionClick(direction) {
//    // Récupère le joueur actif (par exemple le premier joueur pour commencer)
//    let player = players[0]; // À adapter si tu as une gestion de tour

//    // Si latence > 0, on ne peut pas changer de direction
//    if (player.latence > 0 && direction !== player.dir) return;

//    // Change la direction si c'est permis
//    if (direction !== player.dir) {
//        player.dir = direction;
//        player.latence = 3; // Par exemple, 3 tours de latence après un virage
//    }

//    // Déplace le joueur
//    movePlayer(player);

//    // Mets à jour l'affichage
//    //updateGridState();
//    renderGrid();
//    showDirectionControls(player);
//}

function movePlayer(player) {
    // Calcul de la nouvelle position avec wrap-around
    let nextX = player.x, nextY = player.y;
    if (player.dir === 'up') nextY = (player.y - 1 + gridSize) % gridSize;
    if (player.dir === 'down') nextY = (player.y + 1) % gridSize;
    if (player.dir === 'left') nextX = (player.x - 1 + gridSize) % gridSize;
    if (player.dir === 'right') nextX = (player.x + 1) % gridSize;

    // Si collision
    if (grid[nextY][nextX].type !== "empty") {
        // Transforme la case quittée en mur AVANT de traiter la collision
        grid[player.y][player.x] = { type: "wall", playerId: player.id };

        // Si c'est un autre joueur, on l'élimine aussi
        if (grid[nextY][nextX].type === "player") {
            const otherId = grid[nextY][nextX].playerId;
            players[otherId].alive = false;
            player.score++;
        }
        // Marque la case d'arrivée comme "crash"
        grid[nextY][nextX] = { type: "crash", playerId: player.id };
        player.alive = false;
        renderGrid();
        setTimeout(() => {
            alert("Le joueur est éliminé !");
        }, 100);
        return;
    }

    // Si pas de collision, la case quittée devient un mur
    grid[player.y][player.x] = { type: "wall", playerId: player.id };

    // Déplacement du joueur
    player.x = nextX;
    player.y = nextY;
    grid[player.y][player.x] = { type: "player", playerId: player.id };

    // Gère la latence
    if (player.latence > 0) player.latence--;
}

//function rechargeActions() {
//    const now = Date.now();
//    // Ici, choisis le joueur à afficher (par exemple le joueur actif)
//    const player = players[0]; // ou index du joueur courant
//    const vehicle = VEHICLES[player.vehicleId];

//    if (!player.alive) return;
//    if (player.actionGauge < vehicle.maxActionGauge &&
//        now - player.lastActionTime >= vehicle.rechargeTime) {
//        player.actionGauge++;
//        player.lastActionTime = now;
//        updateActionDisplay(player); // <-- mise à jour immédiate
//    }
//}
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














