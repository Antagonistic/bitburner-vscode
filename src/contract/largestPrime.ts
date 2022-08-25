import { NS } from '@ns'

export function largestPrime(ns : NS, data: number) : number | false {
    let f = 2;
    let largest = 1;
    while(data > 1)
    {
        while(data % f==0) 
        {
            data = data/f;
            largest = f;
        }
        f++;
        if(f*f > data) return data;
    }
    return largest;
}