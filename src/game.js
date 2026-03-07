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
let money = 100
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
            moneyImpact: 5,
            price: 20,
            total: 0
        }
    },
    normal: {
        lodge: {    
            name: "Normal Lodging",
            ecoImpact: 0,
            path: "assets/normalLodge.png",
            moneyImpact: 10,
            price: 10,
            total: 0
        }
    },
    polluting: {
        lodge: {
            name: "Polluting Lodging",
            ecoImpact: -2,
            path: "assets/PolluterLodge.png",
            moneyImpact: 15,
            price: 5,
            total: 0
        }
    }
}

const visitorTypes = (
    ecoTourist = {
        name: "Eco Tourist",
        ecoImpact: +1,
        moneyImpact: +5,
    },
    regularTourist = {
        name: "Regular Tourist",
        ecoImpact: 0,
        moneyImpact: +10,
    },
    pollutingTourist = {
        name: "Polluting Tourist",
        ecoImpact: -2,
        moneyImpact: +20,
    }
)

// after types defined, preload sprites and prepare selection
loadSprite("eco", buildingTypes.eco.lodge.path);
loadSprite("normal", buildingTypes.normal.lodge.path);
loadSprite("polluting", buildingTypes.polluting.lodge.path);

let selectedBuilding = null;

window.addEventListener("DOMContentLoaded", ()=>{
    const ecoBtn = document.getElementById("eco-Lodge");
    const defBtn = document.getElementById("def-Lodge");
    const polBtn = document.getElementById("pol-Lodge");
    if(ecoBtn) ecoBtn.addEventListener("click", ()=> selectedBuilding = "eco");
    if(defBtn) defBtn.addEventListener("click", ()=> selectedBuilding = "normal");
    if(polBtn) polBtn.addEventListener("click", ()=> selectedBuilding = "polluting");
});

// Draw grid
for(let x=0; x<wGRID; x++){
    for(let y=0; y<hGRID; y++){

        add([
            rect(TILE, TILE),
            pos(x*TILE+((width()%TILE)/2), y*TILE+((height()%TILE)/2)),
            color(100,200,100),
            area(),
            "tile",
            {gx:x, gy:y}
        ])
    }
}



// Place building on click
onClick("tile",(tile)=>{
    if (!selectedBuilding) {
        debug.log("No building type selected!");
        return; // no type chosen yet
    }

    // create sprite entity first so we can query its natural size
        const building = add([
            sprite(selectedBuilding),
            area(),
            "building",
            {type:selectedBuilding}
        ]);

    // compute scale to fit inside TILE while preserving aspect
    const w = building.width;
    const h = building.height;
    const s = Math.min(TILE / w, TILE / h) * 0.8; // 80% of tile size
    building.scale = s;

    // position verts so the sprite is centered in the tile
    building.pos = vec2(
        tile.pos.x + (TILE - w * s) / 2,
        tile.pos.y + (TILE - h * s) / 2
    );

    // add to the stack
    // selectedBuilding is a string like "eco" or "normal", not an object, so
    // `selectedBuilding.price` was always undefined.  look up the price in
    // buildingTypes instead and subtract from money when purchased.
    const price = buildingTypes[selectedBuilding].lodge.price;
    if (price <= money) {
        money -= price;                  // pay for the building
        buildings.push(building);

        const taxEl = document.getElementById("tax-score-value");
        tax = calcTax(buildings, buildingTypes);
        if (taxEl) taxEl.innerText = tax;

        const moneyEl = document.getElementById("money-score-value");
        if (moneyEl) {
            if (money >= 0) {
                money += tax;
                moneyEl.innerText = money
            }
        }
    } else {
        debug.log("YOU ARE TOO POOR !!!!!!!!!");
    }

})

// Visitor simulation
function spawnVisitor(){

    let roll = rand(0,1)

    if(roll < 0.33){

        eco += 1
        money += 5
        debug.log("Eco tourist arrived")

    }

    else if(roll < 0.9){

        money += 10
        debug.log("A New Tourist Has Arrived + £10")

    }

    else{

        eco -= 2
        money += 30
        debug.log("Polluting rich tourist arrived")

    }

    eco = Math.max(0, Math.min(10, eco))

}

function calcTax(buildings, buildingTypes) {
    let tax = -1;
    for(let i = 0; i < buildings.length; i++) {
        if (buildings[i].type === "eco") {
            tax -= buildingTypes.eco.lodge.moneyImpact;
        } else if (buildings[i].type === "normal") {
            tax -= buildingTypes.normal.lodge.moneyImpact;
        } else if (buildings[i].type === "polluting") {
            tax -= buildingTypes.polluting.lodge.moneyImpact;
        }
    }
    return tax;
}

// Update every few seconds
loop(tickRate, ()=>{

    if(buildings.length > 0 && guests.length < buildings.length * 5) {
        spawnVisitor()

    }


    // also sync footer DOM if available
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
        // show an immediate message before switching
        add([
            text(msg, { size: 40 }),
            color(255, 0, 0)
        ]);

        wait(2, () => go("lose", { message: msg }));
    }

})
