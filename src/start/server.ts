import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {

    const ram = ns.args[0] ? ns.args[0] : 32;
    const script = ns.args[1] ? ns.args[1] : "share.js"

    let i = ns.getPurchasedServers().length;

    while (i < ns.getPurchasedServerLimit()) {

        if (ns.getServerMoneyAvailable("home")/4 > ns.getPurchasedServerCost(ram)) {
            const hostname = ns.purchaseServer("pserv-" + i, ram);
            if(hostname != '') {
                ns.toast("Purchased server " + hostname);
                const ramNeeded = ns.getScriptRam(script);
                const threads = Math.floor(ram / ramNeeded);
                if(threads > 0) {
                    await ns.scp(script, hostname);
                    ns.exec(script, hostname, threads);
                }
                ++i;
            }
        }
        await ns.sleep(2000);
    }
}