import { NS, ScriptArg } from '@ns'
import { list_servers } from '/lib/scan';
import * as Legion from '/legion/lib/Legion'

function stop(ns: NS, host: string, arg: ScriptArg): void {
    const processes = ns.ps(host).filter((x=>x.filename != Legion.STOP_SCRIPT));
    if(arg.all)
    {
        if(processes.length > 0) {
            ns.killall(host);
            ns.toast(`Stopping all processes on ${host}`);
            return;
        }
    }
    for(const proc of processes) {
        if(arg.force) {
            if(proc.filename.startsWith('/legion')) {
                ns.kill(proc.pid);
            }
        }
        else {
            // gentle stop
            if(Legion.LONG_SCRIPTS.includes(proc.filename)) {
                ns.toast(`Stopping ${proc.filename} on ${host}`);
                ns.kill(proc.pid);
            }
        }
    }
}

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["verbose", false],
        ["force", false],
        ["all",false]
    ]);

    const servers = list_open_servers(ns);
    stop(ns, "home", argsc);
    for(const server of servers) {
        stop(ns, server, argsc);
    }
}