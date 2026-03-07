kaboom({

    width: Element.innerWidth,
    height: Element.innerHeight,
    strech: true,
    background: [135, 206, 235, 0]

})

const tickRate = 10
const TILE = 50
const hGRID = Math.floor(height()/TILE)
const wGRID = Math.floor(width()/TILE)

let tax = -1
let eco = 10
let money = 10000
let buildings = []
let guests = []
let gameOver = false;

scene("lose", (data) => {
    const msg = data && data.message ? data.message : "You Lose!";
    add([
        text(msg, { size: 48, width: width() - 40 }),
        pos(width()/2, height()/2 - 40),
        color(255, 0, 0),
    ]);
    add([
        text("Press [R] to restart", { size: 24 }),
        pos(width()/2, height()/2 + 40),
        color(255, 255, 255),
    ]);
    onKeyPress("r", () => {
        window.location.reload();
    });
});

const buildingTypes = {
    eco: {
        lodge: {
            name: "Eco Friendly Lodging",
            ecoImpact: 2,
            path: "assets/EcoFriendlyLodge.png",
            moneyImpact: 40,
            price: 20,
            total: 0
        },
        shop: {
            name: "Eco Friendly Shop",
            ecoImpact: 1,
            path: "assets/EcoFriendlyShop.png",
            moneyImpact: 10,
            price: 15,
            total: 0
        },
        transport: {
            name: "Eco Friendly Transport",
            ecoImpact: 3,
            path: "assets/EcoFriendlyTransport.png",
            moneyImpact: 15,
            price: 20,
            total: 0
        }
    },normal: {
        lodge: {
            name: "Normal Lodging",
            ecoImpact: 0,
            path: "assets/NormalLodge.png",
            moneyImpact: 10,
            price: 10,
            total: 0
        },
        shop: {
            name: "Normal Shop",
            ecoImpact: 0,
            path: "assets/NormalShop.png",
            moneyImpact: 10,
            price: 15,
            total: 0
        },
        transport: {
            name: "Normal Transport",
            ecoImpact: 0,
            path: "assets/NormalTransport.png",
            moneyImpact: 15,
            price: 10,
            total: 0
        }
    },polluting: {
        lodge: {
            name: "Polluting Lodging",
            ecoImpact: -2,
            path: "assets/PolluterLodge.png",
            moneyImpact: 15,
            price: 5,
            total: 0
        },
        shop: {
            name: "Polluting Shop",
            ecoImpact: -1,
            path: "assets/PolluterShop.png",
            moneyImpact: 20,
            price: 10,
            total: 0
        },
        transport: {
            name: "Polluting Transport",
            ecoImpact: -3,
            path: "assets/PolluterTransport.png",
            moneyImpact: 25,
            price: 20,
            total: 0
        }
    }
}

const visitorTypes = [
    {
        name: "Eco Tourist",
        category: "eco",
        ecoImpact: +1,
        moneyImpact: +5,
    },
    {
        name: "Regular Tourist",
        category: "normal",
        ecoImpact: 0,
        moneyImpact: +10,
    },
    {
        name: "Polluting Tourist",
        category: "polluting",
        ecoImpact: -2,
        moneyImpact: +20,
    }
];

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
for (const cat in buildingTypes) {
    for (const kind in buildingTypes[cat]) {
        const spriteName = cat + capitalize(kind);
        loadSprite(spriteName, buildingTypes[cat][kind].path);
    }
}

let currentTool = "build";

let selectedBuilding = null;

function makeSelector(buttonId, category, kind) {
    const btn = document.getElementById(buttonId);
    if (btn) btn.addEventListener("click", () => {
        currentTool = "build";
        selectedBuilding = { category, kind };
        debug.log(`selected ${category} ${kind}`);
    });
}

window.addEventListener("DOMContentLoaded", ()=>{
    makeSelector("eco-Lodge", "eco", "lodge");
    makeSelector("def-Lodge", "normal", "lodge");
    makeSelector("pol-Lodge", "polluting", "lodge");

    makeSelector("eco-Shop", "eco", "shop");
    makeSelector("def-Shop", "normal", "shop");
    makeSelector("pol-Shop", "polluting", "shop");

    makeSelector("eco-Transport", "eco", "transport");
    makeSelector("def-Transport", "normal", "transport");
    makeSelector("pol-Transport", "polluting", "transport");

    const bd = document.getElementById("bulldozer");
    if (bd) bd.addEventListener("click", () => {
        currentTool = "bulldozer";
        selectedBuilding = null;
        debug.log("bulldozer selected");
    });
});

for(let x=0; x<wGRID; x++){
    for(let y=0; y<hGRID; y++){

        add([
            rect(TILE, TILE),
            pos(x*TILE+((width()%TILE)/2), y*TILE+((height()%TILE)/2)),
            color(100,200,100),
            area(),
            "tile",
            {gx:x, gy:y, occupied: false}  
        ])
    }
}




onClick("tile",(tile)=>{
    // demolition mode takes precedence
    if (currentTool === "bulldozer") {
        if (!tile.occupied) {
            debug.log("Nothing to bulldoze");
            return;
        }
        // find the building that sits on this tile
        const b = buildings.find(b => b.tile === tile);
        if (b) {
            const def = buildingTypes[b.category] && buildingTypes[b.category][b.kind];
            if (def) {
                const refund = Math.floor(def.price * 0.6);
                money += refund;
                const moneyEl = document.getElementById("money-score-value");
                if (moneyEl) moneyEl.innerText = money;
            }
            destroy(b);
            buildings = buildings.filter(x => x !== b);
        }
        tile.occupied = false;
        return;
    }

    if (!selectedBuilding) {
        debug.log("No building type selected!");
        return;
    }
    if (tile.occupied) {
        debug.log("Tile already has a building");
        return;
    }

    const { category, kind } = selectedBuilding;
    const typeDef = buildingTypes[category] && buildingTypes[category][kind];
    if (!typeDef) {
        debug.log("invalid building selection", selectedBuilding);
        return;
    }
    const price = typeDef.price;
    if (price > money) {
        debug.log("Not enough money for that building");
        return;
    }
    money -= price;

    const spriteName = category + capitalize(kind);
    const building = add([
        sprite(spriteName),
        area(),
        "building",
        { category, kind }
    ]);

    building.tile = tile;

    const w = building.width;
    const h = building.height;
    const s = Math.min(TILE / w, TILE / h) * 0.8; 
    building.scale = s;

    building.pos = vec2(
        tile.pos.x + (TILE - w * s) / 2,
        tile.pos.y + (TILE - h * s) / 2
    );


    buildings.push(building);
    
    tile.occupied = true;
    const taxEl = document.getElementById("tax-score-value");
    tax = calcTax(buildings, buildingTypes);
    if (taxEl) taxEl.innerText = tax;

    const moneyEl = document.getElementById("money-score-value");
    if (moneyEl) {
        moneyEl.innerText = money;
    } else {
        debug.log("YOU ARE TOO POOR !!!!!!!!!");
    }
})

function spawnVisitor(){
    const counts = {};
    buildings.forEach(b => {
        if (b.category) {
            counts[b.category] = (counts[b.category] || 0) + 1;
        }
    });

    let pool = [];
    visitorTypes.forEach(vt => {
        const w = counts[vt.category] || 0;
        for (let i = 0; i < w; i++) {
            pool.push(vt);
        }
    });

    if (pool.length === 0) {
        pool = visitorTypes.slice();
    }
    const vt = pool[Math.floor(rand(0, pool.length - 1))];
    eco = Math.max(0, Math.min(10, eco + vt.ecoImpact));
    money += vt.moneyImpact;
    debug.log(`${vt.name} arrived`);
    guests.push(vt);
}

function calcTax(buildings, buildingTypes) {
    let tax = -1;
    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        const cat = b.category;
        const kind = b.kind;
        if (cat && kind && buildingTypes[cat] && buildingTypes[cat][kind]) {
            tax -= buildingTypes[cat][kind].moneyImpact;
        }
    }
    return tax;
}

loop(tickRate, ()=>{

    if(buildings.length > 0 && guests.length < buildings.length * 5) {
        spawnVisitor()

    }


    const ecoEl = document.getElementById("eco-score-value");
    const popEl = document.getElementById("pop-score-value");
    if (ecoEl) ecoEl.innerText = eco;
    
    const moneyEl = document.getElementById("money-score-value");
    if (moneyEl) {
        if (money >= 0) {
            money += tax;
            moneyEl.innerText = money
        }
    }
    if (popEl) popEl.innerText = guests.length;

    const taxEl = document.getElementById("tax-score-value");
    tax = calcTax(buildings, buildingTypes);
    if (taxEl) taxEl.innerText = tax;
})

onUpdate(()=>{

    if (gameOver) return;

    if (eco <= 0 || money <= 0) {
        gameOver = true;
        let msg = "";
        if (eco <= 0 && money <= 0) {
            msg = "BROKE";
        } else if (eco <= 0) {
            msg = "ENVIRONMENT COLLAPSED";
        } else {
            msg = "Brokey";
        }
        add([
            text(msg, { size: 40 }),
            color(255, 0, 0)
        ]);
        wait(2, () => go("lose", { message: msg }));
    }
})
