import { NS } from '@ns'
import * as Skills from '/start/lib/skills'

let taskFocus = false;

function uniHack(ns: NS): boolean
{
    const player = ns.getPlayer();
    const cash = player.money;
    const incomeSecure = cash > 1000000;
    if(Skills.UNIVERSITIES[player.location])
    {
        if(cash > 0 && incomeSecure)    
        {
            if(ns.singularity.universityCourse(Skills.UNIVERSITIES[player.location], Skills.HACK_COURSE_BEST, taskFocus))
                return true;
        } else
        {
            if(ns.singularity.universityCourse(Skills.UNIVERSITIES[player.location], Skills.HACK_COURSE_FREE, taskFocus))
                return true;
        }
    }

    // Can't study
    return false;
}

function gymTrain(ns: NS): boolean
{
    const player = ns.getPlayer();
    const cash = player.money;
    if(cash > 0 && Skills.GYMS[player.location])
    {
        const stats = [player.skills.strength, player.skills.agility, player.skills.defense, player.skills.dexterity];
        const least = Math.min(stats[0], stats[1], stats[2], stats[3]);
        if(least == stats[0])
        {
            if(ns.singularity.gymWorkout(Skills.GYMS[player.location], "Strength", taskFocus)) return true;
        }
        if(least == stats[1])
        {
            if(ns.singularity.gymWorkout(Skills.GYMS[player.location], "Agility", taskFocus)) return true;
        }
        if(least == stats[2])
        {
            if(ns.singularity.gymWorkout(Skills.GYMS[player.location], "Defense", taskFocus)) return true;
        }
        if(least == stats[3])
        {
            if(ns.singularity.gymWorkout(Skills.GYMS[player.location], "Dexterity", taskFocus)) return true;
        }
    }
    // Can't gym
    return false;
}

function factionWorkTrain(ns: NS, hacking = true)
{
    // Train via field work, hacking contract or security work

    const factions = ns.getPlayer().factions;
    if(factions && factions.length > 0)
    {
        for(const fact of factions)
        {
            if(ns.singularity.workForFaction(fact, "Field Work"))
                return true;
        }
        if(hacking) 
        {
            for(const fact of factions)
            {
                if(ns.singularity.workForFaction(fact, Skills.HACKING_WORK))
                    return true;
            }
        }
        else
        {
            for(const fact of factions)
            {
                if(ns.singularity.workForFaction(fact, Skills.SECURITY_WORK))
                    return true;
            }
        }
    }
    return false;
}

function basicHacking(ns: NS, force = false): boolean
{
    const player = ns.getPlayer();
    if(player.skills.hacking < Skills.BASIC_LEVEL*player.mults.hacking || force)
    {
        // Train via field work or hacking contract
        const factionWorkAvailable = factionWorkTrain(ns, true);
        if(!factionWorkAvailable)
        {
            // No faction, study at Uni you guess
            return uniHack(ns);
        } else return factionWorkAvailable;
        
    }
    return false;
}

function basicCombat(ns: NS, force = false)
{
    const player = ns.getPlayer();
    if(
        player.skills.strength < Skills.BASIC_LEVEL*player.mults.strength ||
        player.skills.agility < Skills.BASIC_LEVEL*player.mults.agility ||
        player.skills.defense < Skills.BASIC_LEVEL*player.mults.defense ||
        player.skills.dexterity < Skills.BASIC_LEVEL*player.mults.dexterity ||
        force
        )
    {
        const factionWorkAvailable = factionWorkTrain(ns, false);
        if(!factionWorkAvailable)
        {
            return gymTrain(ns);
        } else return factionWorkAvailable;
    }
    return false;
}

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["tail", false],
        ["test", false],
        ["focus", false]
    ]);
    if(argsc.tail) ns.tail();

    if(argsc.focus) taskFocus = true;
    if(ns.singularity.getOwnedAugmentations(false).includes(Skills.FOCUS_AUG)) taskFocus = false;

    while(true)
    { 
        // basic hacking
        let hasJob = false;
        if(!hasJob) hasJob = basicHacking(ns);
        if(!hasJob) hasJob = basicCombat(ns);
        
        if(!hasJob)
        {
            const player = ns.getPlayer();
            if(
                player.skills.hacking > Skills.BASIC_LEVEL*player.mults.hacking &&
                player.skills.agility > Skills.BASIC_LEVEL*player.mults.agility &&
                player.skills.defense > Skills.BASIC_LEVEL*player.mults.defense &&
                player.skills.dexterity > Skills.BASIC_LEVEL*player.mults.dexterity &&
                player.skills.strength > Skills.BASIC_LEVEL*player.mults.strength
            )
            {
                // Skills training done
                ns.toast(`Skills training complete!`);
                break;
            }
        }

        if(argsc.test) break;
        await ns.sleep(30000);
    }

    if(argsc.test) ns.tprint(`Skills training complete!`);
}