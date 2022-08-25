import { NS } from '@ns'

export function StockTraderI(ns : NS, data: number[]): number | false {
    const len = data.length;
    let maxProfit = 0;
    for(let i = 0; i<len-1; i++)
    {
        for(let j = 0; j<len; j++)
        {
            const profit = data[j]-data[i];
            if(profit>maxProfit) maxProfit = profit;
        }
    }
    return maxProfit;
}