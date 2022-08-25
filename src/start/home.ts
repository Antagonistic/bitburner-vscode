import { NS } from '@ns'

const CORE_WALL = 4
const DARKWEB_WALL = 10
const DARKWEB_PROGRAMS = ["BruteSSH.exe", "FTPCrack.exe", "HTTPWorm.exe", "relaySMTP.exe", "SQLInject.exe", "AutoLink.exe", "DeepscanV1.exe", "DeepscanV2.exe", "ServerProfiler.exe", "Formulas.exe"]

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["tail", false],
        ["test", false]
    ]);
    if(argsc.tail) ns.tail();

    while(true)
    {
        let cash = ns.getServerMoneyAvailable("home");

        const ramCost = ns.singularity.getUpgradeHomeRamCost();
        const coresCost = ns.singularity.getUpgradeHomeCoresCost();
        const tor = ns.getPlayer().tor;

        if(cash > ramCost) // no wall, buy when you can afford
        {
            if(ns.singularity.upgradeHomeRam())
            {
                ns.toast(`Bought more home ram!`);
                cash -= ramCost;
            }
        }

        if(cash > coresCost*CORE_WALL)
        {
            if(ns.singularity.upgradeHomeCores())
            {
                ns.toast(`Bought more home cores`);
                cash -= coresCost;
            }
        }

        if(!tor && cash > 200000)
        {
            if(ns.singularity.purchaseTor())
            {
                ns.toast(`TOR Router purchased!`);
                cash -= 200000;
            }
        }

        if(tor)
        {
            for(const prog of DARKWEB_PROGRAMS)
            {
                if(!ns.fileExists(prog, "home"))
                {
                    const cost = ns.singularity.getDarkwebProgramCost(prog);
                    if(cash > ns.singularity.getDarkwebProgramCost(prog)*DARKWEB_WALL)
                    {
                        if(ns.singularity.purchaseProgram(prog))
                        {
                            ns.toast(`Bought ${prog}!`);
                            cash -= cost;
                        }
                    }
                }
            }
        }

        if(argsc.test) break;
        await ns.sleep(30000);
    }
}