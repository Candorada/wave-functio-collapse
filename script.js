class Grid{
    constructor(width,height){
        this.width = width;
        this.height = height;
        this.items = Grid.whGrid(width,height,{"R":0,"G":0,"B":0,"A":0});
    }
    static whGrid(w,h,f){
        return [...new Array(w)].map((a,x)=>[...new Array(h)].map((b,y)=>({...f,...{"x":x,"y":y}})))
    }
    async wright(img){
        const IMG = await new Promise((res,rej)=>{
            const i = new Image();
            i.src = img;
            i.onload = () => res(i);
            i.onerror = rej;
        });
        const canvas = document.createElement("canvas");
        canvas.width = IMG.width;
        canvas.height = IMG.height;
        this.width = IMG.width;
        this.height = IMG.height;
        this.items = Grid.whGrid(this.width,this.height,{"R":0,"G":0,"B":0,"A":0});
        const ctx = canvas.getContext("2d");
        ctx.drawImage(IMG, 0, 0);
        const data = ctx.getImageData(0, 0, IMG.width, IMG.height).data;
        for(let i=0;i<IMG.width;i++){
            for(let j=0;j<IMG.height;j++){
                for(let k in "RGBA"){
                    this.items[i][j]["RGBA"[k]] = data[j*IMG.width*4+i*4+ +k];

                }
            }
        }         
    }
    addToWorld(p=document.body) {
        let t = document.createElement("table");
        p.appendChild(t);
        for(let i=0;i<this.height;i++){
            let r = document.createElement("tr");
            for(let j=0;j<this.width;j++){
                let td = document.createElement("td");
                r.appendChild(td);
            }
            t.appendChild(r);
        }
        return t;
    }
    draw(o=document.body){
        let grid = this.items
        let width = grid.length;
        let height = grid[0].length;
        let td = o.querySelectorAll("td");
        for(let i=0;i<td.length;i++){
            let x = i%width;
            let y = Math.floor(i/width);//there is probably an issue here
            //td[i].innerText = `${this.items[x][y]?.options?.length}`;
            td[i].style.backgroundColor = `rgb(${grid[x][y]["R"]},${grid[x][y]["G"]},${grid[x][y]["B"]})`;
        }
    }
    sub([x,y],[w,h]){
        let grid = new Grid(w,h);
        for(let i=0;i<w;i++){
            for(let j=0;j<h;j++){
                //clamped x and y
                let cx = (this.width+(i+x)%this.width)%this.width;
                let cy = (this.height+(j+y)%this.height)%this.height;
                grid.items[i][j] = this.items[cx][cy];
            }
        }
        return grid;
    }
    /**
     * @constructor
     * @param {Grid} grid
     * @returns true|false
     */
    equals(grid){
        if(this.width !== grid.width || this.height !== grid.height) return false;
        for(let i=0;i<this.width;i++){
            for(let j=0;j<this.height;j++){
                const keys = Object.keys(this.items[i][j])
                for(let k of keys){
                    if(this.items[i][j][k] != grid.items[i][j][k])return false;
                }
            }
        }
        return true;
    }
    /**
     * @callback forEach
     * @param {int} x
     * @param {int} y
     * @param {Object} value
     */

    /**
     * @param {forEach} c (x,y,value)=>{}
     * 
     */
    forEach(c){
        for(let x in this.items){
            for(let y in this.items[x]){
                c(x,y,this.items[x][y]);
            }
        }
    }
}
const b = window.document.body;
let gridExists = false;
class Tile{
    /**
     * @param {Grid} grid 
     */
    constructor(i,j,grid){
        this.grid = grid;
        this.value = grid.items[i][j];
        this.subRegion = grid.sub([i-1,j-1],[3,3]);
        /**
         * @type {{"UP":Tile[],"DOWN":Tile[],"LEFT":Tile[],"RIGHT":Tile[]}}
         */
        this.adjacencies = {
            "UP":[],
            "DOWN":[],
            "LEFT":[],
            "RIGHT":[]
        }
        /*
        grid.forEach((x,y)=>{
            const tile = grid.sub([x-1,y-1],[3,3]);
            const u = this.subRegion.sub([0,0],[3,2]);
            const d = this.subRegion.sub([0,1],[3,2]);
            const l = this.subRegion.sub([0,0],[2,3]);
            const r = this.subRegion.sub([1,0],[2,3]);
            const u2 = tile.sub([0,0],[3,2]);
            const d2 = tile.sub([0,1],[3,2]);
            const l2 = tile.sub([0,0],[2,3]);
            const r2 = tile.sub([1,0],[2,3]);
            const a = this.adjacencies;
            if(u.equals(d2)) a["UP"].push(tile);
            if(d.equals(u2)) a["DOWN"].push(tile);
            if(l.equals(r2)) a["LEFT"].push(tile);
            if(r.equals(l2)) a["RIGHT"].push(tile);
        })
        */
    }
    static getAllTiles(grid){
        let t = [];
        let w=grid.width;
        let h=grid.height;
        for(let i=0;i<w;i++){
            for(let j=0;j<h;j++){
                const tile = new Tile(i,j,grid);
                t.push(tile);
            }
        }
        return t;
    }
}

//redo tile class, or remove it, make it so that there is only 81 tiles and every tiles adjacencies links to another tile.
function getAllAdjacencies(x,y,tiles){

}
/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {Grid} grid 
 * @returns {{"UP":Tile,"DOWN":Tile,"LEFT":Tile,"RIGHT":Tile}}
 */
function neighbors(x,y,grid){
    let sub = grid.sub([x-1,y-1],[3,3]);
    let u = sub.items[1][0].tile;
    let d = sub.items[1][2].tile;
    let l = sub.items[0][1].tile;
    let r = sub.items[2][1].tile;
    return {"UP":u,"DOWN":d,"LEFT":l,"RIGHT":r};
}
function intersection(a,b){
    return a.filter(obj => b.includes(obj));
}

(async ()=>{
let grid = new Grid(0,0);
await grid.wright("City.png")
let t = grid.addToWorld(b)
grid.draw(t)
let tiles = Tile.getAllTiles(grid); //just loop over every single element and then check for overlaps
console.log(tiles)
let output = new Grid(grid.width,grid.height);
output.forEach((x,y,v)=>{
    v["tile"] = null;
})

function calculateEntropy(grid){
    grid.forEach((x,y,v)=>{
        let n = neighbors(x,y,grid);
        let options = [...tiles];
        for(let key of Object.keys(n)){
            let tile = n[key];
            let inverse = {"UP":"DOWN","DOWN":"UP","LEFT":"RIGHT","RIGHT":"LEFT"}[key];
            if(tile != null){
                console.log(options,tile.adjacencies[inverse])
                options = intersection(options,tile.adjacencies[inverse])

            }
        }
        v.options = options;
    })
}
/*
for(let i=0;i<1;i++){
    calculateEntropy(output)
    output.forEach((x,y,v)=>{
        let n = neighbors(x,y,output);
        let options = [...tiles];
        for(let key of Object.keys(n)){
            let tile = n[key];
            let inverse = {"UP":"DOWN","DOWN":"UP","LEFT":"RIGHT","RIGHT":"LEFT"}[key];
            if(tile != null){
                options = intersection(options,tile.adjacencies[inverse])

            }
        }
        v.options = options;
    })
    let map = output.items.map(x=>x.filter(y=>!y.tile)).filter(x=>x.length)
    let x = Math.floor(Math.random()*map.length);
    let y = Math.floor(Math.random()*map[x].length);
    let selectedTile = map[x][y].options[Math.floor(Math.random()*output.items[x][y].options.length)];
    let [x2,y2] = [selectedTile.value.x,selectedTile.value.y]
    output.items[x2][y2].tile = selectedTile
    output.items[x2][y2].R = selectedTile.value.R;//wrong X Y, the correct X Y is inside of the randomely chosen tile
    output.items[x2][y2].G = selectedTile.value.G;  
    output.items[x2][y2].B = selectedTile.value.B;
    output.items[x2][y2].A = selectedTile.value.A;
    console.log(output)
}
*/
//calculateEntropy(output)


//basically loop over the tiles and find the lowest entropy, then set v["tile"]
//to be the tile in the options array
let a = output.addToWorld(b);
output.draw(a);
/*
let tile = new Tile(0,0,grid);
let tie = tile.subRegion.addToWorld(b);
tile.subRegion.draw(tie);
tie.style.backgroundColor = "red"
for(TIL of tile.adjacencies["UP"]){ //this no giving correct adjacencies
    let ti = TIL.addToWorld(b);
    TIL.draw(ti);
}
*/
/*
for(let y=0;y<tr.length;y++){
    let td = tr[y].querySelectorAll("td")
    for(let x=0;x<td.length;x++){
        let sub = grid.sub([x-1,y-1],[3,3]);
        td[x].innerText = "";
        let t = sub.addToWorld(td[x])
        t.classList.add("hover")
        sub.draw(td[x])
    }
}
*/






})()