import { NS } from '@ns'
import { list_servers } from '/lib/scan'

const script_name = "/legion/job/share.js" ;

function home_share(ns : NS) {
    const host = "home";
    if(ns.getRunningScript(script_name)) ns.kill(script_name, "home");
    let threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script_name));
    threads = Math.floor(threads/4);
    if(threads > 0) {
        ns.tprint(`Launching script '${script_name}' on server '${host}' with ${threads} threads`);
        ns.exec(script_name, host, threads);
    }
}

async function server_share(ns: NS, host: string, clean: boolean): number
{
    if(host == "home") return;
    if(clean) {
        ns.killall(host);
    }
    const threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script_name));
    if(threads > 0) {
        await ns.scp(script_name, host, "home");
        ns.tprint(`Launching script '${script_name}' on server '${host}' with ${threads} threads`);
        ns.exec(script_name, host, threads);
    }
    return threads;
}

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["tail", false]
    ]);
    if(argsc.tail) ns.tail();
    const servers = list_servers(ns);
    const open_servers = servers.filter(s=>ns.hasRootAccess(s));
    home_share(ns);
    for(const server of open_servers) {
        if(ns.getServerMaxRam(server)>0) {
            await server_share(ns, server, false);
        }
    }

    await ns.sleep(1000);
    ns.tprint(`Share power: ${ns.getSharePower().toFixed(2)}`);
}