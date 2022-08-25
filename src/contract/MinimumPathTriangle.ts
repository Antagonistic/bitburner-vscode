import { NS } from '@ns'

function MinimumPathTriangleRecurse(ns: NS, data: number[], x: number, y: number): number {
    if(y == data.length - 1) return data[y][x];
    let minRet = 9999;
    if(x > 0)
    {
        const ret = MinimumPathTriangleRecurse(ns, data, x-1, y+1);
        if(ret<minRet) minRet = ret;
    }
    {
        const ret = MinimumPathTriangleRecurse(ns, data, x, y+1);
        if(ret<minRet) minRet = ret;
    }
    {
        const ret = MinimumPathTriangleRecurse(ns, data, x+1, y+1);
        if(ret<minRet) minRet = ret;
    }
    return minRet+data[y][x];
}

export function MinimumPathTriangle(ns : NS, data: number[]): number | false {
    return MinimumPathTriangleRecurse(ns, data, 0, 0);
    //return false;
}