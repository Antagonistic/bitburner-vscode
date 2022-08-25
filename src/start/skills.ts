import { NS } from '@ns'
import { doJoinFactionwork, doRepWork, workFactions, getAugFactions, getAvailableAugs } from '/start/faction'
import * as Skills from '/start/lib/skills'

let taskFocus = false;

// Note that functions in this script return TRUE if player still available after, false if player got a job

function uniHack(ns: NS): boolean
{
    const player = ns.getPlayer();
    const incomeSecure = ns.gang.inGang() || ns.getTotalScriptIncome() > 1000;
    const cash = player.money;
    if(cash > 0 && incomeSecure && player.city != Skills.BEST_UNIV)
    {
        if(cash > Skills.TRAVEL_COST*10)
        {
            ns.singularity.travelToCity(Skills.BEST_UNIV);
        }
    }
    const loc = ns.getPlayer().city;
    if(Skills.UNIVERSITIES[loc])
    {
        
        if(cash > 0 && incomeSecure)
        {
            if(ns.singularity.universityCourse(Skills.UNIVERSITIES[loc], Skills.HACK_COURSE_BEST, taskFocus))
                return true;
        } else
        {
            if(ns.singularity.universityCourse(Skills.UNIVERSITIES[loc], Skills.HACK_COURSE_FREE, taskFocus))
                return true;
        }
    }

    // Can't study
    return false;
}

function gymTrain(ns: NS): boolean
{
    const player = ns.getPlayer();
    const incomeSecure = ns.gang.inGang() || ns.getTotalScriptIncome() > 1000;
    const cash = player.money;
    if(cash > 0 && incomeSecure && player.city != Skills.BEST_GYM)
    {
        if(cash > Skills.TRAVEL_COST*10)
        {
            ns.singularity.travelToCity(Skills.BEST_GYM);
        }
    }
    const loc = ns.getPlayer().city;
    //ns.tprint(`${player.city} ${Skills.GYMS[player.city]} ${cash}`)
    if(cash > 0 && Skills.GYMS[loc])
    {
        const stats = [player.skills.strength, player.skills.agility, player.skills.defense, player.skills.dexterity];
        const least = Math.min(stats[0], stats[1], stats[2], stats[3]);
        if(least == stats[0])
        {
            if(ns.singularity.gymWorkout(Skills.GYMS[loc], "Strength", taskFocus)) return true;
        }
        if(least == stats[1])
        {
            if(ns.singularity.gymWorkout(Skills.GYMS[loc], "Agility", taskFocus)) return true;
        }
        if(least == stats[2])
        {
            if(ns.singularity.gymWorkout(Skills.GYMS[loc], "Defense", taskFocus)) return true;
        }
        if(least == stats[3])
        {
            if(ns.singularity.gymWorkout(Skills.GYMS[loc], "Dexterity", taskFocus)) return true;
        }
    }
    // Can't gym
    return false;
}

function factionWorkTrain(ns: NS, hacking = true)
{
    // Train via field work, hacking contract or security work

    const factions = ns.getPlayer().factions;
    const ingang = ns.gang.inGang();
    if(factions && factions.length > 0)
    {
        for(const fact of factions)
        {
            if(ingang && fact == Skills.GANG_FACTION) continue;
            if(ns.singularity.workForFaction(fact, Skills.FIELD_WORK, taskFocus))
                return true;
        }
        if(hacking) 
        {
            for(const fact of factions)
            {
                if(ingang && fact == Skills.GANG_FACTION) continue;
                if(ns.singularity.workForFaction(fact, Skills.HACKING_WORK, taskFocus))
                    return true;
            }
        }
        else
        {
            for(const fact of factions)
            {
                if(ingang && fact == Skills.GANG_FACTION) continue;
                if(ns.singularity.workForFaction(fact, Skills.SECURITY_WORK, taskFocus))
                    return true;
            }
        }
    }
    return false;
}

export function crimeTrain(ns: NS): boolean
{
    if(ns.singularity.getCrimeChance(Skills.BASIC_CRIME3) < 0.5)
    {
        if(ns.singularity.getCrimeChance(Skills.BASIC_CRIME2) < 0.4)
        {
            return ns.singularity.commitCrime(Skills.BASIC_CRIME, taskFocus)
        }
        else
        {
            return ns.singularity.commitCrime(Skills.BASIC_CRIME2, taskFocus);
        }
    }
    else
    {
        return ns.singularity.commitCrime(Skills.BASIC_CRIME3, taskFocus);
    }
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
            if(!gymTrain(ns))
            {
                return crimeTrain(ns);
            }
            else return true;
        } else return true;
    }
    return false;
}

function karmaGrind(ns: NS)
{
    if(ns.heart.break() > Skills.GANG_KARMA)
    {
        if(ns.singularity.getCrimeChance(Skills.BEST_KARMA_CRIME) < 0.5)
        {
            if(!basicCombat(ns, true))
            {
                ns.singularity.commitCrime(Skills.BASIC_KARMA_CRIME, taskFocus);
                return true;
            }
        }
        else
        {
            ns.singularity.commitCrime(Skills.BEST_KARMA_CRIME, taskFocus);
            return true;
        }
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

    ns.disableLog("scan");

    if(argsc.focus) taskFocus = true;
    if(ns.singularity.getOwnedAugmentations(false).includes(Skills.FOCUS_AUG)) taskFocus = false;

    const augs = getAvailableAugs(ns, false, true);
    const factions = getAugFactions(ns, augs);

    while(true)
    { 
        // basic hacking
        let hasJob = false;
        if(!hasJob) hasJob = basicHacking(ns);
        if(!hasJob) hasJob = basicCombat(ns);
        if(!hasJob) hasJob = karmaGrind(ns);
        
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
                //ns.singularity.stopAction();
                // Skills training done
                //ns.toast(`Skills training complete!`);
                
                if(!await workFactions(ns, factions, taskFocus))
                    crimeTrain(ns);
            }
        }

        if(argsc.test) break;
        await ns.sleep(30000);
    }

    if(argsc.test) ns.tprint(`Skills training complete!`);
}