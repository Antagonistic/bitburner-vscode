import { NS } from '@ns'

export function RLEncoding(ns: NS, data: string): string {
    let item: string = data[0];
    let ret = "";
    let count = 1;
    for(let i = 1; i< data.length; i++)
    {
        if(data[i] == item && count < 9) {
            count++;
        }
        else
        {
            ret = ret + count + item;
            count = 1;
            item = data[i];
        }
    }
    ret = ret + count + item;
    ns.tprintf(`answer ${ret}`);
    return ret;
}