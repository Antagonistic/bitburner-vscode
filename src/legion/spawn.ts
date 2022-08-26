import { NS } from '@ns'
import { print_score, print_score_string, score_server } from 'legion/lib/score';
import * as Legion from 'legion/lib/Legion'

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["test", false]
    ]);
    const target: string = argsc['_'][0];

    ns.disableLog("sleep");

    const host = ns.getServer();
    let targetServ = ns.getServer(target);

    if(targetServ.moneyAvailable < targetServ.moneyMax || targetServ.hackDifficulty > targetServ.minDifficulty)
    {
        if(argsc.test) ns.tprint(`Spawn: Reset of ${target} needed`);
        // Server reset needed
        await Legion.wait_PID(ns, Legion.exec_Reset(ns, host.hostname, target));
        targetServ = ns.getServer(target);
    }


    let score = score_server(ns, target, host.cpuCores);
    if(!score){
        ns.tprint(`Failed to score server ${target}!`);
        return;
    }
    if(argsc.test) print_score(ns, score);

    if(argsc.test) {
        targetServ = ns.getServer(target);
        ns.tprint(`${target}  Money: ${targetServ.moneyAvailable}/${targetServ.moneyMax}  Sec: ${targetServ.hackDifficulty.toFixed(2)}/${targetServ.minDifficulty}`);
    }

    const memGrow = ns.getScriptRam(Legion.GROW_SCRIPT)
    const memHack = ns.getScriptRam(Legion.HACK_SCRIPT)
    const memWeak = ns.getScriptRam(Legion.WEAK_SCRIPT)

    // Queue 10 batches ahead of time
    //const base_delay = 500;
    const queueExecDelayData: Legion.ExecDelay[] = [];
    do {
        score = score_server(ns, target, host.cpuCores);
        if(!score){
            ns.tprint(`Failed to score server ${target}!`);
            return;
        }
        ns.print(print_score_string(ns, score));
        const batch_mem = memGrow*score.growThreads+memHack*score.hackThreads+memWeak*score.weakThreads;
        const batches = Math.floor((ns.getServerMaxRam(host.hostname)-ns.getServerUsedRam(host.hostname))*0.9/batch_mem)
        if(batches == 0)
        {
            ns.tprint(`No available memory for even one batch!`);
            return;
        }
        const base_delay = Math.max(score.maxTime/batches,500);
        if(argsc.test) ns.tprint(`Aiming for ${batches} simultaneously batches with a delay of ${ns.tFormat(base_delay)}`);

        const batch_size = Math.min(Math.max(batches*2,10),100);
        if(argsc.test) ns.tprint(`Spawn: Queue ${batch_size} batches`);
        for(let i = 0; i< batch_size; i++) {
            const hackdelay = score.maxTime - score.hacktime + base_delay*i;
            const growdelay = score.maxTime - score.growtime + 50 + base_delay*i;
            const weakdelay = score.maxTime - score.weakentime + 150 + base_delay*i;

            queueExecDelayData.push({
                exec: "hack",
                delay: hackdelay,
                threads: score.hackThreads,
                target: target,
                host: host.hostname});
            queueExecDelayData.push({
                exec: "grow",
                delay: growdelay,
                threads: score.growThreads,
                target: target,
                host: host.hostname});
            queueExecDelayData.push({
                exec: "weak",
                delay: weakdelay,
                threads: score.weakThreads,
                target: target,
                host: host.hostname});
        }
        if(argsc.test) ns.tprint(`Spawn: Queued ${queueExecDelayData.length} items, max time of ${ns.tFormat(queueExecDelayData.length*batch_size+score.maxTime)}`);
        await Legion.queueExecDelay(ns, queueExecDelayData, argsc.test);
        if(argsc.test) ns.tprint(`Spawn: Spawn Queue complete`);

        let targetServ = ns.getServer(target);

        if(targetServ.moneyAvailable < targetServ.moneyMax || targetServ.hackDifficulty > targetServ.minDifficulty)
        {
            if(argsc.test) ns.tprint(`Spawn: Reset of ${target} needed`);
            // Server reset needed
            await Legion.wait_PID(ns, Legion.exec_Reset(ns, host.hostname, target));
            targetServ = ns.getServer(target);
        }

    } while(!argsc.test)

    if(argsc.test) {
        await ns.sleep(1000);
        targetServ = ns.getServer(target);
        ns.tprint(`${target}  Money: ${targetServ.moneyAvailable}/${targetServ.moneyMax}  Sec: ${targetServ.hackDifficulty.toFixed(2)}/${targetServ.minDifficulty}`);
    }
}

export function autocomplete(data: AutocompleteData): string[] {
    return [...data.servers, "--test", "--tail"]; // This script autocompletes the list of servers and flags.
}