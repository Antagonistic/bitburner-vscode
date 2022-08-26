import { NS } from '@ns'

export const HACK_SCRIPT = "/legion/job/hack.js";
export const GROW_SCRIPT = "/legion/job/grow.js";
export const WEAK_SCRIPT = "/legion/job/weak.js";
export const SHARE_SCRIPT = "/legion/job/share.js";
export const RESET_SCRIPT = "/legion/reset.js";
export const SPAWN_SCRIPT = "/legion/spawn.js";
export const MAIN_SCRIPT = "/legion/main.js";
export const STOP_SCRIPT = "/legion/stop.js";
export const GROWSPAM_SCRIPT = "/legion/job/growspam.js";

export const LONG_SCRIPTS = [MAIN_SCRIPT, SPAWN_SCRIPT, RESET_SCRIPT, GROWSPAM_SCRIPT]
export const JOB_SCRIPTS = [HACK_SCRIPT, GROW_SCRIPT, WEAK_SCRIPT]

/** @public */
export enum ExecVariant {
    HACK = "hack",
    GROW = "grow",
    WEAK = "weak"
  }
  
  /** @public */
  export type ExecVariantValues = `${ExecVariant}`;

export interface ExecDelay {
    exec: ExecVariantValues,
    delay: number,
    threads: number,
    host?: string,
    target?: string
}

export function exec_Hack(ns: NS, host: string, threads: number, target: string): number {
    if(threads <= 0) return 0;
    return ns.exec(HACK_SCRIPT, host, threads, target, performance.now());
}

export function exec_Grow(ns: NS, host: string, threads: number, target: string): number {
    if(threads <= 0) return 0;
    return ns.exec(GROW_SCRIPT, host, threads, target, performance.now());
}

export function exec_Weak(ns: NS, host: string, threads: number, target: string): number {
    if(threads <= 0) return 0;    
    return ns.exec(WEAK_SCRIPT, host, threads, target, performance.now());
}

export function exec_Reset(ns: NS, host: string, target: string): number {
    return ns.exec(RESET_SCRIPT, host, 1, target);
}

export function exec_Spawn(ns: NS, host: string, target: string, test: boolean): number {
    if(test) return ns.exec(SPAWN_SCRIPT, host, 1, target, "--test");
    return ns.exec(SPAWN_SCRIPT, host, 1, target);
}

export async function deploy_exec_GrowSpam(ns: NS, host: string, target: string): number {
    await ns.scp(GROWSPAM_SCRIPT, host);
    const mem = ns.getScriptRam(GROWSPAM_SCRIPT);
    const ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
    let threads = Math.floor(ram/mem);
    if(host == "home") threads = Math.floor(threads*0.9);
    if(threads <= 0) return 0;
    return ns.exec(GROWSPAM_SCRIPT, host, threads, target, performance.now());
}

export async function wait_PID(ns: NS, PID: number): number
{
    let i = 0;
    while(true)
    {
        if(ns.getRunningScript(PID) == null) return;
        await ns.sleep(50);
        i++;
        if(i > 1000*60*60)
        {
            critical(ns, `ERROR: wait_PID was waiting for over an hour. ${ns.getRunningScript()} terminated`);
        }
    }
    return i*50;
}

export function critical(ns: NS, message: string): void {
    ns.tprint(message);
    ns.toast(message,"error", null);
}

export async function queueExecDelay(ns: NS, queue: ExecDelay[], verbose = false): void
{
    const _queue = queue.sort((a,b)=>a.delay-b.delay);
    let delayTot = 0;
    const startTime = performance.now();
    //if(verbose) ns.tprint(`Time ${startTime}`);
    for(const q of _queue)
    {
        const now = performance.now()
        if(verbose && Math.abs(delayTot - now + startTime) > 10) ns.tprint(`Time adjust ${delayTot.toFixed(0)} to ${(now - startTime).toFixed(0)}`);
        delayTot = now - startTime
        const sleepdelay = q.delay - delayTot;
        if(sleepdelay>3)
        {
            //if(verbose) ns.tprint(`sleep ${sleepdelay.toFixed(0)} to reach ${q.delay.toFixed(0)}`);
            await ns.sleep(sleepdelay-3);
            delayTot+=sleepdelay;
        }
        //if(verbose) ns.tprint(`Time ${delayTot.toFixed(2)} ${q.exec} ${q.threads} ${q.delay.toFixed(0)} ${q.target}`);
        switch(q.exec)
        {
            case "hack": {exec_Hack(ns, q.host, q.threads, q.target);}
            break;
            case "grow": {exec_Grow(ns, q.host, q.threads, q.target);}
            break;
            case "weak": {exec_Weak(ns, q.host, q.threads, q.target);}
            break;
            default:
                ns.toast(`Unknown exec queue type ${q.exec}!`, "warning");
        }
    }
}