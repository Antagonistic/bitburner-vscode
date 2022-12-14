import { NS } from '@ns'
import * as Legion from 'legion/lib/Legion'

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["verbose", false],
        ["tail", false]
    ]);
    if(argsc.tail) ns.tail();
    const target = argsc['_'][0];

    ns.disableLog("sleep");

    let server = ns.getServer(target);
    const host = ns.getServer();
    if(argsc.verbose) ns.tprint(`Reset of ${target} running on ${host.hostname}`);
    let growThreads = 0;
    let growSec = 0;
    let weakThreads = 0;
    let growtime = 0;
    let weaktime = 0;
    let finishTime = 0;
    const memGrow = ns.getScriptRam(Legion.GROW_SCRIPT);
    const memWeak = ns.getScriptRam(Legion.WEAK_SCRIPT);
    if(server.moneyAvailable<server.moneyMax)
    {
        growThreads = Math.ceil(ns.growthAnalyze(target, (server.moneyMax/server.moneyAvailable), host.cpuCores));
        growSec = 0.004*growThreads*host.cpuCores;
        growtime = ns.getGrowTime(target);
        if(argsc.verbose) ns.tprint(`Need Grow: ${server.moneyAvailable}/${server.moneyMax} using ${growThreads} threads taking ${ns.tFormat(growtime)}`)
    }
    if(server.hackDifficulty>server.minDifficulty || growSec>0) {
        const weakenPower = ns.weakenAnalyze(1,host.cpuCores);
        weakThreads = Math.ceil(((server.hackDifficulty-server.minDifficulty)+growSec)/weakenPower);
        weaktime = ns.getWeakenTime(target);
        if(argsc.verbose) ns.tprint(`Need Weak: ${server.hackDifficulty.toFixed(2)}/${server.minDifficulty} with ${growSec} growth sec gain using ${weakThreads} threads taking ${ns.tFormat(weaktime)}`)
    }
    ns.print(`RESET: ${target}. Money: ${server.moneyAvailable.toFixed(0)}/${server.moneyMax}  Sec: ${server.hackDifficulty.toFixed(2)}/${server.minDifficulty} `)
    ns.print(`RESET: ${target}. growThreads: ${growThreads}  weakThreads: ${weakThreads} `);
    ns.print(`RESET: ${target}. growtime: ${ns.tFormat(growtime)}  weaktime: ${ns.tFormat(weaktime)} `);
    if(growThreads == 0 && weakThreads == 0)
    {
        ns.toast(`No reset needed for ${target}`)
        if(argsc.verbose) ns.tprint(`No reset needed for ${target}. Money: ${server.moneyAvailable.toFixed(0)}/${server.moneyMax}  Sec: ${server.hackDifficulty.toFixed(2)}/${server.minDifficulty} `)
        return;
    }

    finishTime = Math.max(growtime, weaktime)+150;

    ns.toast(`Resetting server ${target}, will take ${ns.tFormat(finishTime)}`, "info");
    if(argsc.verbose) ns.tprint(`Resetting server ${target}, will take ${ns.tFormat(finishTime)}`);
    
    let growPID = 0;
    let partial = false;
    let availMem = (ns.getServerMaxRam(host.hostname)-ns.getServerUsedRam(host.hostname))*0.9;
    if(growThreads*memGrow+weakThreads*memWeak > availMem)
    {
        partial = true;
    }
    if(partial)
    {
        const newGrowThreads = Math.min(Math.floor(availMem/memGrow), growThreads);
        const newWeakThreads = Math.min(Math.floor(availMem/memWeak), weakThreads);
        ns.print(`RESET: Partial: ${target}. growThreads: ${newGrowThreads}/${growThreads}  weakThreads: ${newWeakThreads}/${weakThreads} `);
        if(newGrowThreads == 0 || newWeakThreads == 0)
        {
            ns.tprint(`Failed to start any partial threads on host ${host.hostname}, RAM available is ${availMem}`);
            return;
        }
        while(growThreads > 0)
        {
            await Legion.wait_PID(ns, Legion.exec_Grow(ns, host.hostname, newGrowThreads, target));
            growThreads-=newGrowThreads;
        }
        while(weakThreads > 0)
        {
            await Legion.wait_PID(ns, Legion.exec_Weak(ns, host.hostname, newWeakThreads, target));
            weakThreads-=newWeakThreads;
        }
    }
    else
    {
    
        if(growThreads > 0) {
            growPID = Legion.exec_Grow(ns, host.hostname, growThreads, target);
            if(growPID == 0) { ns.tprint(`Failed to start ${growThreads} grow threads on host ${host.hostname}: ${growPID}`);}
            if(weaktime < growtime){
                const pauseTime = growtime-weaktime+50;
                await ns.sleep(pauseTime);
                finishTime -= pauseTime;
            }
        }

        availMem = (ns.getServerMaxRam(host.hostname)-ns.getServerUsedRam(host.hostname))
        const weakPID = Legion.exec_Weak(ns, host.hostname, weakThreads, target);
        if(weakPID == 0) { ns.tprint(`Failed to start ${weakThreads} weak threads on host ${host.hostname}: ${weakPID}`);}

        await ns.sleep(finishTime);

        if((ns.getRunningScript(growPID)) != null || ns.getRunningScript(weakPID) != null)
        {
            ns.tprint(`Reset script wait issue, jobs not complete!`);
            if(ns.getRunningScript(growPID)) ns.tprint(`Waited ${await Legion.wait_PID(growPID)} ms extra for grow`);
            if(ns.getRunningScript(weakPID)) ns.tprint(`Waited ${await Legion.wait_PID(weakPID)} ms extra for weak`);
        }
    }

    server = ns.getServer(target);

    if(server.moneyAvailable<server.moneyAvailable || server.hackDifficulty > server.minDifficulty)
    {
        ns.tprint(`Reset script issue, ${server.hostname} not fully reset!`);
        ns.tprint(`Money: ${server.moneyAvailable}/${server.moneyMax}  Sec: ${server.hackDifficulty.toFixed(2)}/${server.minDifficulty}`);
    }

    ns.toast(`Server reset ${server.hostname} complete!`, "success");
    if(argsc.verbose) ns.tprint(`Server reset ${server.hostname} complete!`);

}

export function autocomplete(data: AutocompleteData): string[] {
    return [...data.servers, "--verbose", "--tail"]; // This script autocompletes the list of servers and flags.
}