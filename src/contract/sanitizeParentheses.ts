import { NS } from '@ns'

function sanitizeParenthesesValid(ns: NS, test: string[]) {
    const ret = [];
    for(const element of test) {
        let level = 0;
        let valid = true;
        for(let c = 0; c<element.length; c++) {
            const _c = element[c];
            if(_c == '(') {
                level++;
            }
            if(_c == ')') {
                level--;
                if(level<0) valid = false;
            }
        }
        if(level>0) valid = false;
        if(valid) {
            ret.push(element);
        }
    }
    return ret;
}

function removeOne(input: string) {
    const ret = [];
    for(let i = 0; i<input.length; i++)
    {
        if(input[i] == '(' || input[i] == ')') {
            const temp = input.substring(0,i) + input.substring(i+1);
            ret.push(temp);
        }
    }
    return ret;
}

export function sanitizeParentheses(ns: NS, data: string): false | string[] {
    const max_removals = 7;
    let collect = [];
    collect.push(data);
    for(let i = 0; i<max_removals; i++)
    {
        const values = [];
        for(let j = 0; j<collect.length; j++) {
            const newArr = removeOne(collect[j]);
            for(let k = 0; k<newArr.length; k++) {
                if(values.indexOf(newArr[k]) == -1){
                    values.push(newArr[k]);
                }
            }
        }
        const valid = sanitizeParenthesesValid(ns, values);
        if(valid.length>0) return valid;
        collect = values;
    }
    return false;
}