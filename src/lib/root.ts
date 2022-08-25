import { NS } from '@ns'

export async function root(ns : NS, target: string): boolean {
    if(!ns.hasRootAccess(target)) {
        const my_hacklevel = ns.getHackingLevel();
        let ports_apps = 0;
        let can_ssh = 0;
        let can_ftp = 0;
        let can_http = 0;
        let can_smtp = 0;
        let can_sql = 0;
        if(ns.fileExists("BruteSSH.exe","home"))
        {
            can_ssh = 1;
            ports_apps++;
        }
        if(ns.fileExists("FTPCrack.exe","home"))
        {
            can_ftp = 1;
            ports_apps++;
        }
        if(ns.fileExists("HTTPWorm.exe"))
        {
            can_http = 1;
            ports_apps++;
        }
        if(ns.fileExists("relaySMTP.exe", "home"))
        {
            can_smtp = 1;
            ports_apps++;
        }
        if(ns.fileExists("SQLInject.exe", "home"))
        {
            can_sql = 1;
            ports_apps++;
        }

        const targetPorts = ns.getServerNumPortsRequired(target);
        const hackLevel = ns.getServerRequiredHackingLevel(target);

        if(ns.getHackingLevel() < hackLevel){
            ns.tprint(`Hacking level for server ${target} too low, require ${ns.getHackingLevel()}/${hackLevel}.`);
            return;
        }
        if(ports_apps < targetPorts){
            ns.tprint(`Need more open ports apps.  Have ${ports_apps} need ${targetPorts}.`);
            return;
        }

        let portNeed = targetPorts;
        if(portNeed > 0 && can_ssh) {
            ns.brutessh(target);
            portNeed--;
        }
        if(portNeed > 0 && can_ftp) {
            ns.ftpcrack(target);
            portNeed--;
        }
        if(portNeed > 0 && can_http) {
            ns.httpworm(target);
            portNeed--;
        }
        if(portNeed > 0 && can_smtp) {
            ns.relaysmtp(target);
            portNeed--;
        }
        if(portNeed > 0 && can_sql) {
            ns.sqlinject(target);
            portNeed--;
        }
        ns.nuke(target);
    }
}