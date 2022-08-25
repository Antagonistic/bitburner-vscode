import { NS } from '@ns'
import { exec_wrap, wait_wrap } from '/lib/exec_wrap';

const GANG_FACTION = "Slum Snakes";
const NFG = "NeuroFlux Governor";

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["tail", false],
        ["test", false],
        ["report", false],
        ["buy", false]
    ]);
    if(argsc.tail) ns.tail();
    if(argsc.test) test = true;

    // Buy any available augments
    await wait_wrap(ns, exec_wrap(ns, "/start/faction.ts", "--buy"));

    const ingang = ns.gang.inGang();
    let maxRep = 0;
    let maxFact;
    for(const faction of ns.getPlayer().factions)
    {
        if(ingang && faction == GANG_FACTION) continue;
        const rep = ns.singularity.getFactionRep(faction);
        if(rep > maxRep)
        {
            maxRep = rep;
            maxFact = faction;
        }
    }

    while(ns.singularity.purchaseAugmentation(maxFact, NFG))
    {
        ns.tprint(`Purchased NFG!`);
        ns.toast(`Purchased NFG!`);
    }

    ns.singularity.installAugmentations("start.js")
}