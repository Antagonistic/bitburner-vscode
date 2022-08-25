import { NS } from '@ns'

export function LZDecompression(ns: NS, data: string): string | false {
    let ret = "";
    let i = 0;
    while(i<data.length)
    {
        let count = parseInt(data[i]);
        i++;
        if(count > 0) {
        ret = ret + data.substring(i, i+count);
            i+=count;
        }

        if(i >= data.length) break;

        count = parseInt(data[i]);
        i++;
        if(count > 0) {
            const offset = parseInt(data[i]);
            i++;
            while(count>0){
                const start = ret.length - offset;
                ret = ret + ret.substring(start, start+count);
                count -= offset;
            }
        }
    }
    return ret;
}