import { NS } from '@ns'

export function Caesar(ns: NS, data: (string | number)[]): string | false {
    const input: string = data[0];
    const shift: number = data[1];
    const A_ASCII: number = "A".charCodeAt(0);
    const Z_ASCII: number = "Z".charCodeAt(0);
    let ret = "";

    for(const c of input)
    {
        if(c==" ")
        {
            ret = ret + " ";
            continue;
        }
        let val = c.charCodeAt(0)-shift;
        if(val < A_ASCII) val = val + Z_ASCII - A_ASCII + 1;
        ret = ret + String.fromCharCode(val);
    }

    return ret;
}