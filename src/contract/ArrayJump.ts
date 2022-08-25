import { NS } from '@ns'

function arrayJumpingRecurse(ns: NS, data: array[number], pos: number, count: number): number
{
    if(pos >= data.length-1) return count; // got the end

    let minJump = 999;
    for(let i = 1; i<=data[pos]; i++)
    {
        const jump = arrayJumpingRecurse(ns, data, pos+i, count+1);
        if(jump < minJump) minJump = jump;
    }
    return minJump;
}

export function arrayJumping(ns: NS, contract_data: array[number]): number
{
    let minJump = arrayJumpingRecurse(ns, contract_data, 0, 0);
    if(minJump == 999) minJump = 0;
    return minJump;
}