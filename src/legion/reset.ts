import { NS } from '@ns'
import * as Legion from 'legion/lib/Legion'

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["verbose", false]
    ]);
    const target = argsc['_'][0];

    let server = ns.getServer(target);
    const host = ns.getServer();
    if(argsc.verbose) ns.tprint(`Reset of ${target} running on ${host.hostname}`);
    let growThreads = 0;
    let growSec = 0;
    let weakThreads = 0;
    let growtime = 0;
    let weaktime = 0;
    let finishTime = 0;
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
    if(growThreads == 0 && weakThreads == 0)
    {
        ns.toast(`No reset needed for ${target}`)
        if(argsc.verbose) ns.tprint(`No reset needed for ${target}. Money: ${server.moneyAvailable}/${server.moneyMax}  Sec: ${server.hackDifficulty.toFixed(2)}/${server.minDifficulty} `)
        return;
    }

    finishTime = Math.max(growtime, weaktime)+150;

    ns.toast(`Resetting server ${target}, will take ${ns.tFormat(finishTime)}`, "info");
    if(argsc.verbose) ns.tprint(`Resetting server ${target}, will take ${ns.tFormat(finishTime)}`);
    
    let growPID = 0;
    if(growThreads > 0) {
        growPID = Legion.exec_Grow(ns, host.hostname, growThreads, target);
        if(growPID == 0) { ns.tprint(`Failed to start ${growThreads} grow threads on host ${host.hostname}: ${growPID}`);}
        if(weaktime < growtime){
            const pauseTime = growtime-weaktime+50;
            await ns.sleep(pauseTime);
            finishTime -= pauseTime;
        }
    }

    const weakPID = Legion.exec_Weak(ns, host.hostname, weakThreads, target);
    if(weakPID == 0) { ns.tprint(`Failed to start ${weakThreads} weak threads on host ${host.hostname}: ${weakPID}`);}

    await ns.sleep(finishTime);

    if((ns.getRunningScript(growPID)) != null || ns.getRunningScript(weakPID) != null)
    {
        ns.tprint(`Reset script wait issue, jobs not complete!`);
        if(ns.getRunningScript(growPID)) ns.tprint(`Waited ${await Legion.wait_PID(growPID)} ms extra for grow`);
        if(ns.getRunningScript(weakPID)) ns.tprint(`Waited ${await Legion.wait_PID(weakPID)} ms extra for weak`);
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