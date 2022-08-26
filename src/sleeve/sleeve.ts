import { NS } from '@ns'
import * as Skills from '/start/lib/skills'

function sleeveCrime(ns: NS, i: number): boolean
{
    if(ns.sleeve.getTask(i)?.type == "CRIME") return true;   
    return ns.sleeve.setToCommitCrime(i, Skills.BASIC_CRIME);
}

export async function main(ns : NS) : Promise<void> {
    const num = ns.sleeve.getNumSleeves();
    for(let i = 0; i< num; i++)
    {
        const info = ns.sleeve.getInformation(i);
        const stats = ns.sleeve.getSleeveStats(i);
        let hasJob = false;
        if(stats.sync < 100)
            hasJob = ns.sleeve.setToSynchronize(i);
        if(!hasJob && stats.shock > 0)
            hasJob = ns.sleeve.setToShockRecovery(i);
        if(!hasJob)
            hasJob = sleeveCrime(ns, i);
    }
}