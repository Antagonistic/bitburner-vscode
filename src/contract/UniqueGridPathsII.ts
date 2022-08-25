import { NS } from '@ns'

function UniquePathsRecurse(ns: NS, grid: number[][], x: number, y: number): number
{
    
    if(y == grid.length - 1 && x == grid[0].length - 1) return 1;
    let ret = 0;
    
    if(y+1 < grid.length && grid[y+1][x] == 0) ret = ret + UniquePathsRecurse(ns, grid, x, y+1);
    if(x+1 < grid[0].length && grid[y][x+1] == 0) ret = ret + UniquePathsRecurse(ns, grid, x+1, y);
    //ns.tprint(`x ${x} y ${y} ret ${ret}`);
    return ret;
}

export function UniqueGridPathsII(ns : NS, contractdata: number[][]) : number | false {
    //ns.tprint(`y-len ${contractdata.length}`)
    //ns.tprint(`x-len ${contractdata[0].length}`)
    return UniquePathsRecurse(ns, contractdata, 0, 0);
    //return false;
}