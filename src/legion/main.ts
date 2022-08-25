import { NS } from '@ns'
import { list_servers } from 'lib/scan'
import { IScore, print_score, score_servers } from '/legion/lib/score'
import * as Legion from '/legion/lib/Legion'



export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["verbose", false],
        ["test", false],
        ["top",false]
    ]);
    let scores: IScore[];
    if(argsc['_'][0]) {
        const target = argsc['_'][0];
        const open_servers = [target];
        scores = score_servers(ns, open_servers);
    }
    else
    {
        const all_servers = list_servers(ns);
        const open_servers = all_servers.filter(s=>ns.hasRootAccess(s));
        scores = score_servers(ns, open_servers);
    }
    const host = ns.getServer().hostname

    if(argsc.top) {
        for(const target of scores.slice(0,11)) {
            print_score(ns, target);
        }
    } 
    else
    {
        for(const target of scores.slice(0, 2)) {
            if(!argsc.test) {
                print_score(ns, target);
                Legion.exec_Spawn(ns, host, target.name);
            }
            else {
                Legion.exec_Spawn(ns, host, target.name, true);
            }
        }
    }
    
}