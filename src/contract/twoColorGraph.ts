import { NS } from '@ns'

export function twoColorGraph(ns: NS, data: number[][][] | number[]): number[] | false {
    const num_vert:number = data[0];
    const edges:number[][] = data[1];

    const adjacency = [];
    for (let i = 0; i < num_vert; i++) {
        adjacency.push(new Array(num_vert).fill(0));
    }
    for (const edge of edges) {
        const v1 = edge[0];
        const v2 = edge[1];
        adjacency[v1][v2] = 1;
        adjacency[v2][v1] = 1;
    }

    const ret:number[] = new Array(num_vert).fill(-1);
    ret[0] = 0;

    //for(let i = 0; i<num_vert; i++) ns.tprint(`${adjacency[i]}`);

    let j = 0;
    while(ret.includes(-1) && j < 500)
    {
        for(let i = 0; i< num_vert; i++) {
            if(ret[i]>=0)
            {
                for(let j = 0; j<num_vert; j++)
                {
                    if(adjacency[i][j] == 1)
                    {
                        const newval = ret[i]==0?1:0;
                        if(ret[j] > -1 && ret[j] != newval) return [];
                        ret[j] = newval;
                    }
                }
            }
        }
        j++;
    }
    if(j>=500) ns.tprint(`Loop detected, answer so far: ${ret}`);

    return ret;
}