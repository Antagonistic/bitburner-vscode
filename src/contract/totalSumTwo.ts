import { NS } from '@ns'

function solveTotalSumTwoRecurse(ns: NS, target: number, numbers: number[]): number {
    if(target == 0 || numbers.length == 0) return 1;
    if(numbers.length == 1)
    {
        if(numbers[0] > target) return 0;
        if(target % numbers[0] == 0) return 1;
        return 0;
    }
    const sums = Math.floor(target/numbers[0]);
    let ret = 0;
    for(let i = 0; i<=sums; i++)
    {
        const _target = target - numbers[0]*i;
        if(_target == 0) {
            ret++
        }
        else
        {
            ret = ret + solveTotalSumTwoRecurse(ns, _target, numbers.slice(1));
        }
    }
    return ret;
}

export function solveTotalSumTwo(ns: NS, data: number[][]): number {
    const target = data[0];
    const numbers = data[1].reverse();
    const answer = solveTotalSumTwoRecurse(ns, target, numbers);

    return answer;
}