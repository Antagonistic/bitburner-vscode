import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["tail", false],
        ["test", false]
    ]);
    if(argsc.tail) ns.tail();

    while(true)
    {

        if(ns.singularity.upgradeHomeRam())
        {
            ns.toast(`Bought more home ram!`)
        }

        if(argsc.test) break;
        await ns.sleep(30000);
    }
}