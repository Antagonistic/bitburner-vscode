import { GangTaskStats, NS } from '@ns'

export interface IGangTask {
    name: string;
    stat: GangTaskStats;
}

export function getTasks(ns : NS) : IGangTask[] {
    const tasks = [];
    const names = ns.gang.getTaskNames();
    for(const name of names) {
        const stat = ns.gang.getTaskStats(name);
        tasks.push({
            name: name,
            stat: stat
        })
    }
    return tasks;
}