class Grid{
    constructor(width,height){
        this.width = width;
        this.height = height;
        this.items = Grid.whGrid(width,height,{"R":0,"G":0,"B":0,"A":0});
    }
    static whGrid(w,h,f){
        return [...new Array(w)].map(()=>[...new Array(h)].map(x=>({...f})))
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
            td[i].innerText = `${x},${y}`;
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
        if(this.width !== grid.width || this.height !== grid.height){
            return false;
        }
        for(let i=0;i<this.width;i++){
            for(let j=0;j<this.height;j++){
                const keys = Object.keys(this.items[i][j])
                for(let k of keys){
                    if(this.items[i][j][k] != grid.items[i][j][k]){
                        return false;
                    }
                }
            }
        }
        return true;
    }
    /**
     * @callback forEach
     * @param {int} x
     * @param {int} y
     */

    /**
     * @param {forEach} c (x,y)=>{}
     * 
     */
    forEach(c){
        for(let x in this.items){
            for(let y in this.items[x]){
                c(x,y);
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
        this.adjacencies = {
            "UP":[],
            "DOWN":[],
            "LEFT":[],
            "RIGHT":[]
        }
        grid.forEach((x,y)=>{
            const tile = grid.sub([x-1,y-1],[3,3]);
            const u = this.subRegion.sub([0,0],[3,2]);
            const d = this.subRegion.sub([1,0],[3,2]);
            const l = this.subRegion.sub([0,0],[2,3]);
            const r = this.subRegion.sub([1,0],[2,3]);
            const u2 = tile.sub([0,0],[3,2]);
            const d2 = tile.sub([1,0],[3,2]);
            const l2 = tile.sub([0,0],[2,3]);
            const r2 = tile.sub([1,0],[2,3]);
            const a = this.adjacencies;
            if(u.equals(d2)) a["UP"].push(tile);
            if(d.equals(u2)) a["DOWN"].push(tile);
            if(l.equals(r2)) a["LEFT"].push(tile);
            if(r.equals(l2)) a["RIGHT"].push(tile);
        })

    }
}
(async ()=>{
let grid = new Grid(0,0);
await grid.wright("City.png")
let t = grid.addToWorld(b)
grid.draw(t)
let tr = t.querySelectorAll("tr")
let tile = new Tile(0,0,grid);
let tie = tile.subRegion.addToWorld(b);
tile.subRegion.draw(tie);
for(TIL of tile.adjacencies["UP"]){
    let ti = TIL.addToWorld(b);
    TIL.draw(ti);
}
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