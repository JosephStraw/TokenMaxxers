kaboom({

    width: Element.innerWidth,
    height: Element.innerHeight,
    strech: true,
    background: [135, 206, 235, 0]

})

const TILE = 50
const hGRID = Math.floor(height()/TILE)
const wGRID = Math.floor(width()/TILE)
let eco = 10
let money = 100

let buildings = []

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

    const building = add([
        rect(40,40),
        pos(tile.pos.x+5, tile.pos.y+5),
        color(0,150,0),
        area(),
        "building",
        {type:"eco"}
    ])

    buildings.push(building)

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

// Update every few seconds
loop(4, ()=>{

    spawnVisitor()


    // also sync footer DOM if available
    const ecoEl = document.getElementById("eco-score-value");
    const moneyEl = document.getElementById("money-score-value");
    if (ecoEl) ecoEl.innerText = eco;
    if (moneyEl) moneyEl.innerText = money;

})

// Lose condition
onUpdate(()=>{

    if(eco <= 0){
        add([
            text("ENVIRONMENT COLLAPSED", {size:40}),
            pos(width()/2-200,height()/2),
            color(255,0,0)
        ])

        wait(2,()=>go("lose"))

    }

})
