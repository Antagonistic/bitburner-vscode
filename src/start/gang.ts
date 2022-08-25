import { NS } from '@ns'
import { exec_wrap } from '/lib/exec_wrap';

const GANG_SCRIPT = "/gang.js"
const GANG_FACTION = "Slum Snakes"
const GANG_KARMA = -54000

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["tail", false]
    ]);
    if(argsc.tail) ns.tail();

    for(const proc of ns.ps())
    {
        if(proc.filename == GANG_SCRIPT)
            ns.kill(proc.pid);
    }

    if(ns.gang.inGang())
    {
        exec_wrap(ns, GANG_SCRIPT);
    }
    else
    {
        if(ns.heart.break() < GANG_KARMA) {
            if(ns.getPlayer().factions.includes(GANG_FACTION))
            {
                ns.gang.createGang(GANG_FACTION);
                ns.tprint(`Created gang ${GANG_FACTION}!`);
                await ns.sleep(1000);
                exec_wrap(ns, GANG_SCRIPT);
            }
            else
            {
                ns.tprint(`Need to join ${GANG_FACTION} to create gang!`);
            }
        }
        else
        {
            ns.tprint(`Need more negative karma to create gang! ${ns.heart.break()}/${GANG_KARMA}`);
        }
    }
}