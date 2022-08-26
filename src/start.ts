import { NS } from '@ns'
import { exec_wrap } from '/lib/exec_wrap';


/** @param {NS} ns */
export async function main(ns : NS) : Promise<void> {
    const args = ns.flags([
        ["help", false],
        ["tail", false],
        ["service", false],
        ["share",false],
        ["nokill",false],
        ["grind",false],
        ["focus", false]
    ]);
    if(args.tail) ns.tail();
    if (args.help) {
        ns.tprint("This script starts clears jobs and starts up relevant threads.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }
    
    if(!args.nokill) {
        ns.killall("home", true);
    }

    const homeRam = ns.getServer("home").maxRam;

    // Upgrade home
    {
        const homeScriptRam = ns.getScriptRam("/start/home.js");
        if(homeScriptRam<homeRam/5)
            exec_wrap(ns, "start/home.js");
        else
            exec_wrap(ns, "start/home.slim.js")
    }

    // Sleeves
    {
        exec_wrap(ns, "/sleeve/sleeve.js");
    }

    // Train skills
    {
        const skillScriptRam = ns.getScriptRam("/start/skills.js");
        if(skillScriptRam<homeRam/5)
        {
            if(args.focus) exec_wrap(ns, "start/skills.js", "--focus");
            else exec_wrap(ns, "start/skills.js");
        }
        else
        {
            if(args.focus) exec_wrap(ns, "start/skills.slim.js")
            else exec_wrap(ns, "start/skills.slim.js")
        }
    }

    // Faction work
    {
        exec_wrap(ns, "/start/faction.js");
    }
    
    // Starts hacking nearby nodes
    const targetsPID = exec_wrap(ns, "targets.js", "--hack");
    
    // Starts thread to buy servers
    {
        if(homeRam <= 64)
        {
            exec_wrap(ns, "start/server.js", 32);
        }
        else if(homeRam < 1024)
        {
            exec_wrap(ns, "start/server.js", 64);
        }
        else
        {
            exec_wrap(ns, "start/server.js", 128);
        }
    }
    
    // Starts thread to buy and upgrade hacknet
    exec_wrap(ns, "start/hacknet.js");

    // Starts thread to manage gang
    if(ns.gang.inGang()) {
        exec_wrap(ns, "gang.js");
    }
    else if(homeRam>128)
    {
        exec_wrap(ns, "start/gang.js");
    }
    
    while(ns.getRunningScript(targetsPID)){
        await ns.sleep(1000);
    }

    // Redeploy hacking targets
    if(args.grind)
    {
        if(ns.getPlayer().skills.hacking >= 10)
        {
            exec_wrap(ns, 'legion/grindhack.js');
        }
        else
        {
            exec_wrap(ns, 'legion/grindhack.js', 'n00dles');
        }
    }
    else
    {
        if(args.share) exec_wrap(ns, 'start/share.js');
        exec_wrap(ns, "deploy_all.js");
    }
    
    // Check for code contracts
    exec_wrap(ns, "contract.js");
    
    ns.toast("Startup complete");
    ns.tprint("Startup complete");
    
    /*while(args.service) {
        // Starts hacking nearby nodes
        targetsPID = ns.exec("targets.js", "home", 1, "true");
        while(ns.getRunningScript(targetsPID)){
            await ns.sleep(1000);
        }
        // Redeploy hacking targets
        ns.exec("deploy_all.js", "home", 1);
    
        await ns.sleep(60000);
    }*/
}