import { NS } from '@ns'

export function exec_wrap(ns:NS, script: string, ...args: (number | string)[]): number
{
    const mem = ns.getScriptRam(script);
    const availRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    if(mem > availRam)
    {
        ns.tprint(`Unable to launch ${script}, RAM: ${availRam.toFixed(2)}/${mem}`);
        return 0;
    }
    return ns.exec(script, "home", 1, ...args);
}

export async function wait_wrap(ns: NS, PID: number): number
{
    if(PID <= 0) return 0;
    let i = 0;
    while(true)
    {
        if(ns.getRunningScript(PID) == null) return;
        await ns.sleep(50);
        i++;
        if(i > 1000*60*60)
        {
            critical(ns, `ERROR: wait_PID was waiting for over an hour. ${ns.getRunningScript()} terminated`);
        }
    }
    return i*50;
}