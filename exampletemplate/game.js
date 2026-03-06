kaboom({

    width: 1000,
    height: 700,
    background: [135, 206, 235]

})

const TILE = 64
const GRID = 10

let eco = 8
let money = 100

let buildings = []

// UI
const ecoText = add([
    text("Eco: " + eco),
    pos(20,20),
    fixed()
])

const moneyText = add([
    text("Money: $" + money),
    pos(20,50),
    fixed()
])

// Draw grid
for(let x=0; x<GRID; x++){
    for(let y=0; y<GRID; y++){

        add([
            rect(TILE-2, TILE-2),
            pos(x*TILE, y*TILE+100),
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
        pos(tile.pos.x+12, tile.pos.y+12),
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

    else if(roll < 0.66){

        money += 10
        debug.log("Average tourist arrived")

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

    ecoText.text = "Eco: " + eco
    moneyText.text = "Money: $" + money

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