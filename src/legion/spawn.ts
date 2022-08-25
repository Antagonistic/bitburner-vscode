import { NS } from '@ns'
import { print_score, score_server } from 'legion/lib/score';
import * as Legion from 'legion/lib/Legion'

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["test", false]
    ]);
    const target: string = argsc['_'][0];

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

    // Queue 10 batches ahead of time
    const base_delay = 500;
    const queueExecDelayData: Legion.ExecDelay[] = [];
    do {
        score = score_server(ns, target, host.cpuCores);
        if(!score){
            ns.tprint(`Failed to score server ${target}!`);
            return;
        }
        const batch_size = Math.min(score.maxTime/ base_delay,10);
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
        if(argsc.test) ns.tprint(`Spawn: Queued ${queueExecDelayData.length} items, max time of ${0}`);
        await Legion.queueExecDelay(ns, queueExecDelayData, argsc.test);
        if(argsc.test) ns.tprint(`Spawn: Spawn Queue complete`);
    } while(!argsc.test)

    if(argsc.test) {
        await ns.sleep(1000);
        targetServ = ns.getServer(target);
        ns.tprint(`${target}  Money: ${targetServ.moneyAvailable}/${targetServ.moneyMax}  Sec: ${targetServ.hackDifficulty.toFixed(2)}/${targetServ.minDifficulty}`);
    }
}