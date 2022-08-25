import { NS } from '@ns'

export function SubarrayMaxSum(ns : NS, data: number[]) : number | false {
    let maxsum = 0;
    for(let i = 0; i<data.length-1;i++)
    {
        for(let j = i+1; j<=data.length; j++)
        {
            const sum = data.slice(i,j).reduce((a,b)=>a+b, 0);
            if(sum > maxsum)
            {
                //ns.tprintf(`slice ${i} ${j} ${data.slice(i,j)} ${sum}`)
                maxsum = sum;
            }
        }
    }
    return maxsum;
}