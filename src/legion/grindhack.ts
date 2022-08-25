import { NS } from '@ns'
import { list_open_servers } from '/lib/scan';
import * as Legion from '/legion/lib/Legion'

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["verbose", false],
        ["test", false],
        ["noreset", false]
    ]);
    let target = "joesguns";
    if(argsc['_'][0]) {
        target = argsc['_'][0];
    }

    let targetServ = ns.getServer(target);
    const host = ns.getServer();
    if(!argsc.noreset)
    {
        if(targetServ.moneyAvailable < targetServ.moneyMax || targetServ.hackDifficulty > targetServ.minDifficulty)
        {
            if(argsc.test) ns.tprint(`Spawn: Reset of ${target} needed`);
            // Server reset needed
            await Legion.wait_PID(ns, Legion.exec_Reset(ns, host.hostname, target));
            targetServ = ns.getServer(target);
        }
    }

    const servers = list_open_servers(ns);
    servers.push("home");
    for(const server of servers) {
        if(ns.getServerMaxRam(server)>0)
        {
            if(server != "home") ns.killall(server);
            const PID = await Legion.deploy_exec_GrowSpam(ns, server, target);
            if(argsc.test) ns.tprint(`Deploying grind to ${server} PID ${PID}`);
        }
    }

}