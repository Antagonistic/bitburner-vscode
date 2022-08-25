import { NS } from '@ns'

export function StockTraderIII(ns : NS, data: number[]): number | false {
    const len = data.length;
    let maxProfit = 0;
    // 2 trade situation
    for(let i = 0; i<len-3; i++)
    {
        for(let j = i+1; j<len-2; j++)
        {
            for(let k = j+1; k<len-1; k++)
            {
                for(let l = k+1; l<len; l++)
                {
                    const profit = data[j]-data[i] + data[l]-data[k];
                    if(profit>maxProfit) maxProfit = profit;
                }
            }
            
        }
    }
    // Single trade situation
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