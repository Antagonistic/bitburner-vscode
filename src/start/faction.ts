import { NS } from '@ns'
import { shuffle } from 'lodash';
import { list_open_servers, recursiveScan } from '/lib/scan';
import { TextTransforms } from '/lib/TextTransforms';
import { FIELD_WORK, HACKING_WORK, SECURITY_WORK } from '/start/lib/skills';

const GANG_FACTION = "Slum Snakes"

export const FactionNames =  [
    "Illuminati",
    "Daedalus",
    "The Covenant",
    "ECorp",
    "MegaCorp",
    "Bachman & Associates",
    "Blade Industries",
    "NWO",
    "Clarke Incorporated",
    "OmniTek Incorporated",
    "Four Sigma",
    "KuaiGong International",
    "Fulcrum Secret Technologies",
    "BitRunners",
    "The Black Hand",
    "NiteSec",
    "Aevum",
    "Chongqing",
    "Ishima",
    "New Tokyo",
    "Sector-12",
    "Volhaven",
    "Speakers for the Dead",
    "The Dark Army",
    "The Syndicate",
    "Silhouette",
    "Tetrads",
    "Slum Snakes",
    "Netburners",
    "Tian Di Hui",
    "CyberSec"
]

export const CityFactions = [
    "Aevum",
    "Chongqing",
    "Ishima",
    "New Tokyo",
    "Sector-12"
]

export const FactionObtainHint = {
    "ECorp": [{type: "work", data: "ECorp"}, {type: "hack", data: "ecorp"}],
    "MegaCorp": [{type: "work", data: "MegaCorp"}, {type: "hack", data: "megacorp"}],
    "Bachman & Associates": [{type: "work", data: "Bachman & Associates"}, {type: "hack", data: "b-and-a"}],
    "Blade Industries": [{type: "work", data: "Blade Industries"}, {type: "hack", data: "blade"}],
    "NWO": [{type: "work", data: "NWO"}, {type: "hack", data: "nwo"}],
    "Clarke Incorporated": [{type: "work", data: "Clarke Incorporated"}, {type: "hack", data: "clarkinc"}],
    "OmniTek Incorporated": [{type: "work", data: "OmniTek Incorporated"}, {type: "hack", data: "omnitek"}],
    "Four Sigma": [{type: "work", data: "Four Sigma"}, {type: "hack", data: "4sigma"}],
    "KuaiGong International": [{type: "work", data: "KuaiGong International"}, {type: "hack", data: "kuai-gong"}],
    "Fulcrum Secret Technologies": [{type: "work", data: "Fulcrum Secret Technologies"}, {type: "hack", data: "fulcrum"}, {type: "hack", data: "fulcrumassets"}],
    "BitRunners": [{type: "hack", data: "run4theh111z"}],
    "The Black Hand": [{type: "hack", data: "I.I.I.I"}],
    "NiteSec": [{type: "hack", data: "avmnite-02h"}],
    "Aevum": [{type: "travel", loc: "Aevum"}],
    "Chongqing": [{type: "travel", loc: "Chongqing"}],
    "Ishima": [{type: "travel", loc: "Ishima"}],
    "New Tokyo": [{type: "travel", loc: "New Tokyo"}],
    "Sector-12": [{type: "travel", loc: "Sector-12"}],
    "Volhaven": [{type: "travel", loc: "Volhaven"}],
    "Speakers for the Dead": [{type: "crime"}, {type: "murder"}],
    "The Dark Army": [{type: "crime"}, {type: "travel", loc: "Chongqing"}],
    "The Syndicate": [{type: "crime"}, {type: "travel", loc: "Sector-12"}],
    "Silhouette": [{type: "crime"}],
    "Tetrads": [{type: "crime"}, {type: "travel", loc: "Chongqing"}],
    "Slum Snakes": [{type: "crime"}],
    "Tian Di Hui": [{type: "travel", loc: "New Tokyo"}],
    "CyberSec": [{type: "hack", data: "CSEC"}]
}

export const SecretFactionNames = [
    "Bladeburners",
    "Church of the Machine God",
    "Shadows of Anarchy"
]

let test = false

interface AugData
{
    name: string,
    repReq: number,
    price: number,
    faction: string
}

interface AugFaction
{
    name: string,
    repReq: number
}

function getSortedFactions(ns: NS, all: boolean): string[]
{
    const ret = [];
    const ingang = ns.gang.inGang();
    if(ingang)
    {
        ret.push(GANG_FACTION);
    }
    let sortedFactions;
    if(all)
        sortedFactions = FactionNames;
    else
        sortedFactions = ns.getPlayer().factions;
    sortedFactions = sortedFactions.sort((a,b)=>ns.singularity.getFactionFavor(a) - ns.singularity.getFactionFavor(b));
    sortedFactions = sortedFactions.sort((a,b)=>ns.singularity.getFactionRep(a) - ns.singularity.getFactionRep(b));
    for(const faction of sortedFactions.reverse())
    {
        if(ingang && faction == GANG_FACTION) continue;
        ret.push(faction);
    }
    return ret;
}

export function getAugFactions(ns: NS, augs: AugData[]): AugFaction[]
{
    const ret: AugFaction[] = [];
    for(const aug of augs)
    {
        const factData = ret.find((x)=>x.name == aug.faction);
        if(!factData)
            ret.push({name: aug.faction, repReq: aug.repReq})
        else
        {
            if(factData.repReq < aug.repReq) factData.repReq = aug.repReq;
        }
    }
    return ret.sort((a,b)=>ns.singularity.getFactionFavor(a.name) - ns.singularity.getFactionFavor(b.name))
            .sort((a,b)=>ns.singularity.getFactionRep(a.name) - ns.singularity.getFactionRep(b.name)).reverse();
}

function getFactionAugs(ns: NS, availableNow: boolean, faction: string, retAugs: AugData[]): AugData[]
{
    const ret = retAugs;
    const augs = ns.singularity.getAugmentationsFromFaction(faction);
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    for(const aug of augs)
    {
        if(retAugs.some((x)=> x.name == aug)) continue;
        if(ownedAugs.includes(aug)) continue;
        const basePrice = ns.singularity.getAugmentationBasePrice(aug);
        const price = ns.singularity.getAugmentationPrice(aug);
        const repReq = ns.singularity.getAugmentationRepReq(aug);
        if(availableNow)
        {
            if(ns.singularity.getFactionRep(faction) < repReq || price > ns.getPlayer().money)
                continue;
        }
        ret.push({
            name: aug,
            repReq: repReq,
            price: availableNow ? price : basePrice,
            faction: faction
        });
    }
    return ret;
}

export function getAvailableAugs(ns: NS, availableNow: boolean, all: boolean): AugData[]
{
    let ret: AugData[] = [];
    const ingang = ns.gang.inGang();
    if(ingang) {
        const faction = GANG_FACTION;
        ret = getFactionAugs(ns, availableNow, faction, ret);
    }
    const factions = getSortedFactions(ns, all);
    if(factions.length > 1)
    {
        for(const faction of factions)
        {
            ret = getFactionAugs(ns, availableNow, faction, ret);
        }
    }
    return ret.sort((a,b)=> a.price - b.price);
}

function joinFactions(ns: NS, approvedFactions: AugFaction[]): void 
{
    let cityFaction;
    for(const fact of approvedFactions)
    {
        if(CityFactions.includes(fact.name)) cityFaction = fact;
    }
    const factions = ns.singularity.checkFactionInvitations();
    if(factions.length > 0)
    {
        for(const fac of factions)
        {
            if(approvedFactions.length == 0 || approvedFactions.some((x)=>x.name == fac) || (cityFaction && fac == cityFaction) || (!cityFaction && CityFactions.includes(fac)))
                ns.singularity.joinFaction(fac);
        }
    }
}

async function factionBackdoor(ns: NS, server: string)
{
    const open_servers = list_open_servers(ns);
    if(open_servers.includes(server))
    {
        if(!ns.getServer(server).backdoorInstalled)
        {
            if(test) ns.tprint(`Attempting to backdoor ${server}!`);
            const route: string[] = [];
            if(recursiveScan(ns, "", "home", server, route))
            {
                for(const r of route)
                {
                    if(!ns.singularity.connect(r))
                    {
                        ns.tprint(`Route to ${server} failed!`);
                        return;
                    }
                }
                await ns.singularity.installBackdoor();
                ns.singularity.connect("home");
            }
        }
    }
}

function buyAugs(ns: NS)
{
    const augs = getAvailableAugs(ns, true);

    for(const aug of augs.reverse()) // sort by most expensive
    {
        const player = ns.getPlayer();
        const cash = player.money;
        const rep = ns.singularity.getFactionRep(aug.faction);
        const price = ns.singularity.getAugmentationPrice(aug.name);
        if(cash > price && rep > aug.repReq)
        {
            ns.singularity.purchaseAugmentation(aug.faction, aug.name);
            ns.tprint(`Bought aug ${aug.name}`);
        }
    }
}

function doCorpWork(ns: NS, data: string, focus: boolean)
{
    const player = ns.getPlayer();
    if(
        player.skills.agility > 300 &&
        player.skills.strength > 300 &&
        player.skills.dexterity > 300 &&
        player.skills.defense > 300 &&
        player.skills.charisma > 250
    )
    {
        // Security job
        ns.singularity.applyToCompany(data, "Security");
    }
    else if (player.skills.hacking > 275)
    {
        // Security job
        ns.singularity.applyToCompany(data, "Software");
    }
    if(ns.getPlayer().jobs[data] && ns.singularity.workForCompany(data, focus))
        return true;
    return false;
}

export function doRepWork(ns: NS, factions: AugFaction[], focus = false): boolean
{
    const ownFactions = ns.getPlayer().factions;
    const ingang = ns.gang.inGang();
    for(const faction of _.shuffle(factions))
    {
        if(ingang && faction.name == GANG_FACTION) continue;
        if(ownFactions.includes(faction.name))
        {
            if(ns.singularity.getFactionRep(faction.name) > faction.repReq) continue;
            if(ns.fileExists("Formulas.exe"))
            {
                const player = ns.getPlayer();
                const gains: number[] = [0, 0, 0];
                gains[0] = ns.formulas.work.factionGains(player, FIELD_WORK, 0).reputation
                gains[1] = ns.formulas.work.factionGains(player, SECURITY_WORK, 0).reputation
                gains[2] = ns.formulas.work.factionGains(player, HACKING_WORK, 0).reputation

                const maxGain = Math.max(gains[0], gains[1], gains[2]);
                if(maxGain == gains[0])
                {
                    if(ns.singularity.workForFaction(faction.name, FIELD_WORK, focus))
                        return true;
                } 
                else if(maxGain == gains[1])
                {
                    if(ns.singularity.workForFaction(faction.name, SECURITY_WORK, focus))
                        return true;
                }
                else
                {
                    if(ns.singularity.workForFaction(faction.name, HACKING_WORK, focus))
                        return true;
                }
            }
            if(ns.singularity.workForFaction(faction.name, FIELD_WORK, focus))
                return true;
            if(ns.singularity.workForFaction(faction.name, SECURITY_WORK, focus))
                return true;
            if(ns.singularity.workForFaction(faction.name, HACKING_WORK, focus))
                return true;
        }
    }
    return false;
}

export async function doJoinFactionwork(ns: NS, factions: AugFaction[], focus: boolean): boolean
{
    const playerFactions = ns.getPlayer().factions;
    for(const faction of _.shuffle(factions))
    {
        if(playerFactions.includes(faction.name)) continue;
        if(FactionObtainHint[faction.name])
        {
            const hint = _.shuffle(FactionObtainHint[faction.name])[0];
            switch(hint.type)
            {
                case "work":
                    doCorpWork(ns, hint.data, focus);
                    return true;
                case "hack":
                    await factionBackdoor(ns, hint.data);
                    break;
                case "travel":
                    if(ns.getPlayer().money > 5000000)
                    {
                        ns.singularity.travelToCity(hint.loc);
                        return false;
                    }
                    break;
                case "crime":
                    break;
                case "murder":
                    if(ns.getPlayer().numPeopleKilled < 50)
                    {
                        ns.singularity.commitCrime("Homicide", focus);
                        return true;
                    }   
                    break;
            }
        }
    }
    return false;
}

export async function workFactions(ns: NS, factions: AugFaction[], focus: boolean): boolean
{
    const choice = _.random(0, 1)
    switch(choice)
    {
        case 0:
            if(doRepWork(ns, factions, focus))
                return true;
            if(await doJoinFactionwork(ns, factions, focus))
                return true;
            break;
        case 1:
            if(await doJoinFactionwork(ns, factions, focus))
                return true;
            if(doRepWork(ns, factions, focus))
                return true;
            break;
    }
    return false;
}

export async function main(ns : NS) : Promise<void> {
    const argsc = ns.flags([
        ["tail", false],
        ["test", false],
        ["report", false],
        ["buy", false]
    ]);
    if(argsc.tail) ns.tail();
    if(argsc.test) test = true;

    ns.disableLog("scan");

    if(argsc.buy)
    {
        buyAugs(ns);
        return;
    }

    const augs = getAvailableAugs(ns, false, true);
    const factions = getAugFactions(ns, augs);

    if(argsc.report)
    {
        const player = ns.getPlayer();
        const cash = player.money;
        
        if(factions.length > 0)
        {
            ns.tprint(TextTransforms.apply(`Augment factions`, [TextTransforms.Transform.Bold]));
            for(const augFaction of factions)
            {
                const faction = augFaction.name;
                const rep = ns.singularity.getFactionRep(faction);
                const favor = ns.singularity.getFactionFavor(faction);
                const favorgain = ns.singularity.getFactionFavorGain(faction);
                let maxRepNeeded = 0;
                let augcount = 0;
                for(const aug of augs)
                {
                    if(aug.faction == faction && aug.repReq > maxRepNeeded) maxRepNeeded = aug.repReq;
                    if(aug.faction == faction) augcount++;
                }
                const reportLine = `${faction}: ${ns.nFormat(rep,'(0.0 a)')}/${ns.nFormat(augFaction.repReq,'(0.0 a)')} ${favor.toFixed(0)}(+${favorgain.toFixed(1)}) with ${augcount} needed augs`;
                if(rep >= maxRepNeeded)
                {
                    ns.tprint(TextTransforms.apply(reportLine, [TextTransforms.Color.Green]));
                }
                else if(player.factions.includes(faction))
                {
                    ns.tprint(TextTransforms.apply(reportLine, [TextTransforms.Color.Yellow]));
                }
                else
                {
                    ns.tprint(TextTransforms.apply(reportLine, [TextTransforms.Color.Red]));
                }
            }
            ns.tprint("");
        }
        if(augs.length > 0)
        {
            const unavailable = [];
            ns.tprint(TextTransforms.apply(`Available Augs`, [TextTransforms.Transform.Bold]));
            let availCounter = 0
            let unavailCounter = 0
            for(const aug of augs)
            {
                const price = ns.singularity.getAugmentationPrice(aug.name);
                const rep = ns.singularity.getFactionRep(aug.faction);
                const reportLine = `${aug.faction} at ${ns.nFormat(aug.repReq,'(0.0 a)')} rep ${ns.nFormat(price, '($0.00 a)')}: ${aug.name}`;
                if(rep < aug.repReq || aug.price > cash)
                    unavailable.push(aug);
                else
                {
                    if(availCounter > 10) continue;
                    ns.tprint(TextTransforms.apply(reportLine, [TextTransforms.Color.Green]));
                }
                availCounter++;
            }
            ns.tprint("");

            if(unavailable.length > 0)
            {
                ns.tprint(TextTransforms.apply(`Unavailable Augs`, [TextTransforms.Transform.Bold]));
                for(const aug of unavailable)
                {
                    if(unavailCounter > 10) continue;
                    const price = ns.singularity.getAugmentationPrice(aug.name);
                    const rep = ns.singularity.getFactionRep(aug.faction);
                    
                    if(rep < aug.repReq)
                    {
                        const reportLine = `${aug.faction} at ${ns.nFormat(rep,'(0.0 a)')}/${ns.nFormat(aug.repReq,'(0.0 a)')} rep ${ns.nFormat(price, '($0.00 a)')}: ${aug.name}`;
                        ns.tprint(TextTransforms.apply(reportLine, [TextTransforms.Color.Red]));
                    }
                    else if(price > cash)
                    {
                        const reportLine = `${aug.faction} at ${ns.nFormat(aug.repReq,'(0.00 a)')} rep ${ns.nFormat(cash,'($0.00 a)')}/${ns.nFormat(price, '($0.00 a)')}: ${aug.name}`;   
                        ns.tprint(TextTransforms.apply(reportLine, [TextTransforms.Color.Yellow]));
                    }
                    else
                    {
                        const reportLine = `${aug.faction} at ${ns.nFormat(aug.repReq,'(0.00 a)')} rep ${ns.nFormat(price, '($0.00 a)')}: ${aug.name}`;   
                        ns.tprint(TextTransforms.apply(reportLine, [TextTransforms.Color.Green]));
                    }
                    unavailCounter++;
                }
            }
        }
    }
    else
    {
        while(true)
        {
            //if(argsc.test) ns.tprint(`Faction backdoor`)
            //await factionBackdoor(ns);

            if(argsc.test) ns.tprint(`Joining factions`)
            joinFactions(ns, factions);

            if(argsc.test) break;
            await ns.sleep(10000);
        }
    }

    if(argsc.test) ns.tprint(`Skills training complete!`);
}