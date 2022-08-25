import { NS } from '@ns'
import { root } from '/lib/root';
import { list_open_servers, list_servers, recursiveScan } from '/lib/scan';

async function backdoor(ns: NS, server: string): void
{
    const open_servers = list_servers(ns);
    if(open_servers.includes(server))
    {
        if(!ns.getServer(server).backdoorInstalled)
        {
            ns.tprint(`Attempting to backdoor ${server}!`);
            const route: string[] = [];
            if(recursiveScan(ns, "", "home", server, route))
            {
                for(const r of route)
                {
                    if(!ns.singularity.connect(r))
                    {
                        ns.tprint(`Route to ${server} failed!`);
                        return;
                    }
                }
                await ns.singularity.installBackdoor();
                ns.singularity.connect("home");
            }
        }
    }
}

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["tail", false]
    ]);
    if(argsc.tail) ns.tail();
    ns.disableLog("scan");

    if(!ns.singularity.getOwnedAugmentations(false).some((x=>x == "The Red Pill")))
    {
        ns.tprint(`The time is not yet ready`);
        return;
    }
    const target = "w0r1d_d43m0n";
    const server = ns.getServer(target);
    if(!server)
    {
        ns.tprint(`The truth is still hidden`);
        return;
    }

    //while(true)
    {
        if(server.requiredHackingSkill < ns.getPlayer().skills.hacking)
        {
            ns.tprint(`The beginning of the end`);
            if(root(ns, target))
            {
                await backdoor(ns, target);
            }
            else
            {
                ns.tprint(`Need yet more portbreakers`);
            }
        }
        else
        {
            ns.tprint(`Still need to grow: ${server.requiredHackingSkill}/${ns.getPlayer().skills.hacking}`);
        }
        //await ns.sleep(60000);
    }
}