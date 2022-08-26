import { GangOtherInfo, NS } from '@ns'
import { IEquip, getEquip } from '/gang/equip';
import { getTasks, IGangTask } from '/gang/task';
import { shuffleArray } from '/lib/utils';

const names = ["Jim", "Joe", "Violet", "8-ball", "Butcher", "Slick", "Scar", "Fat Tony", "Cain", "Able", "Bones", "Lucky", "Ice", "Knuckles", "Bugsy", "Digger", "Sandman", "Ace", "Twigger", "Rock", "Succubus", "Fear"]
const basicHackLevel = 80;
const basicCombatLevel = 80;
const basicCharismaLevel = 80;
const advHackLevel = 200;
const advCombatLevel = 250;
const advCharismaLevel = 150;

//const ASCEND_VALUE = 2
//const ASCEND_MPL = 10;
const ASCEND_COOLDOWN = 2*1000*60;
const MAX_MEMBERS = 12;
const MAX_RESPECT = 10000000;
//const MAX_REPUTATION = 2500000;

const TASK_WANTED = "Vigilante Justice";
const TASK_WAR = "Territory Warfare";
const TASK_TRAIN = ["Train Hacking","Train Combat","Train Charisma"];
const TASK_RESPECT = "Terrorism";
const TASK_BASIC = "Mug People";
const TASK_MONEY = "Traffick Illegal Arms";
const TASK_MONEY2 = "Human Trafficking";

const wall = 10;

let AscendTimestamp = 0;

function basicEquip(ns: NS, gang: string[], equip: IEquip[]): string[] {
    const available = gang;
    
    let cash = ns.getServerMoneyAvailable("home")/wall;
    for(const g of gang) {
        const info = ns.gang.getMemberInformation(g);
        const bought = info.upgrades;
        for(const eq of equip) {
            if(bought.includes(eq.name)) continue;
            if(eq.cost > cash) break;
            if(ns.gang.purchaseEquipment(g, eq.name))
            {
                //ns.toast(`Bought gang member ${g} a ${eq.name}`);
                cash -= eq.cost;
            }
        }
    }

    return available;
}

// Credit: Mysteyes. https://discord.com/channels/415207508303544321/415207923506216971/940379724214075442
function CalculateAscendTreshold(ns: NS, member: string, isHacking: boolean): number {
    const metric = isHacking ? 'hack_asc_mult' : 'str_asc_mult';
    const mult = ns.gang.getMemberInformation(member)[metric];
    if (mult < 1.632) return 1.6326;
    if (mult < 2.336) return 1.4315;
    if (mult < 2.999) return 1.284;
    if (mult < 3.363) return 1.2125;
    if (mult < 4.253) return 1.1698;
    if (mult < 4.860) return 1.1428;
    if (mult < 5.455) return 1.1225;
    if (mult < 5.977) return 1.0957;
    if (mult < 6.496) return 1.0869;
    if (mult < 7.008) return 1.0789;
    if (mult < 7.519) return 1.073;
    if (mult < 8.025) return 1.0673;
    if (mult < 8.513) return 1.0631;

    return 1.0591;
}

function getNextMemberRespect(ns: NS)
{
    if(ns.gang.getMemberNames().length == MAX_MEMBERS) return -1;
    const numFreeMembers = 3;
    if (this.members.length < numFreeMembers) return 0;

    const i = this.members.length - (numFreeMembers - 1);
    return Math.pow(5, i);
}

function basicAscend(ns: NS, gang: string[]): string[] {
    const available: string[] = [];
    const isHacking = ns.gang.getGangInformation().isHacking;
    for(const g of gang)
    {
        const asc = ns.gang.getAscensionResult(g);
        if(asc){
            //ns.tprint(`${g} ${ns.tFormat(performance.now()-AscendTimestamp)} ago ${CalculateAscendTreshold(ns, g, isHacking)}`);
            if(ns.gang.getMemberNames().length == MAX_MEMBERS || getNextMemberRespect(ns)*0.5>ns.gang.getGangInformation().respect)
            {
                if(ns.gang.getMemberNames().length == MAX_MEMBERS || (performance.now()-AscendTimestamp > ASCEND_COOLDOWN))
                {
                    if( ((!isHacking && asc.str > CalculateAscendTreshold(ns, g, isHacking))
                        || (isHacking && asc.hack > CalculateAscendTreshold(ns, g, isHacking))))
                    {
                        ns.toast(`Gang member ${g} ascended!`);
                        //ns.tprint(`Gang member ${g} ascended!`);
                        ns.gang.ascendMember(g);
                        AscendTimestamp = performance.now();
                        continue;
                    }
                }
            }
        }
        available.push(g);
    }
    return available;
}

function basicTrain(ns: NS, gang: string[]): string[] {
    const available: string[] = [];
    for(const g of gang) {
        let train = false;
        const info = ns.gang.getMemberInformation(g);
        if(ns.gang.getGangInformation().respect < 625) {
            if(Math.random()<0.2) {
                available.push(g);
                continue;
            }
        }
        if(info.hack < basicHackLevel)
        {
            ns.gang.setMemberTask(g, "Train Hacking");
            train = true;
        }
        if(!train && 
            (
                info.agi < basicCombatLevel ||
                info.def < basicCombatLevel ||
                info.str < basicCombatLevel ||
                info.dex < basicCombatLevel))
        {
            ns.gang.setMemberTask(g, "Train Combat");
            train = true;
        }
        if(!train && info.cha < basicCharismaLevel)
        {
            ns.gang.setMemberTask(g, "Train Charisma");
            train = true;
        }
        if(!train) {
            available.push(g);
        }
    }
    return available;
}

function advTrain(ns: NS, gang: string[]) {
    if(gang.length > 6){
        const available: string[] = [];
        for(const g of gang)
        {
            let train = false;
            const info = ns.gang.getMemberInformation(g);
            const rand = Math.random();
            if(rand<0.3) {
                if(!train && 
                    (
                        info.agi < advCombatLevel ||
                        info.def < advCombatLevel ||
                        info.str < advCombatLevel ||
                        info.dex < advCombatLevel))
                {
                    ns.gang.setMemberTask(g, "Train Combat");
                    train = true;
                }
                if(!train && info.hack < advHackLevel)
                {
                    ns.gang.setMemberTask(g, "Train Hacking");
                    train = true;
                }
                if(!train && info.cha < advCharismaLevel)
                {
                    ns.gang.setMemberTask(g, "Train Charisma");
                    train = true;
                }
            }
            if(!train) {
                available.push(g);
            }
        }
        return available;
    }
    return gang;
}

function basicWar(ns: NS, gang: string[]): string[]
{
    for(const g of gang)
    {
        ns.gang.setMemberTask(g, TASK_WAR);
    }
    return [];
}

function basicTask(ns: NS, gang: string[], tasks: IGangTask[], layingLow: boolean, war: boolean, verbose: boolean): string[] {
    if(verbose) ns.tprint(`basicTask entered with ${gang.length} members`);
    const available: string[] = [];
    const ganginfo = ns.gang.getGangInformation();
    if(gang.length == 0) return available;

    const threat = otherGangThreat(ns);

    let vigilantes = (layingLow ? Math.floor(gang.length * 0.4) : 0) + (ganginfo.wantedLevel>500 ? 1 : 0);
    let respect = (!layingLow && ganginfo.respect < MAX_RESPECT && gang.length > 4) ? Math.ceil(gang.length * 0.2) : 0;
    if(ns.gang.getMemberNames().length < MAX_MEMBERS) respect = Math.max(respect, 1);
    let money = (!layingLow && gang.length > 4) ? Math.ceil(gang.length * 0.3) : 1;
    if(ganginfo.wantedPenalty > 0.9) money = 0;
    //let warriors = (threat && gang.length > 8) ? Math.ceil(gang.length * 0.4): 1;
    let trainers = gang.length > 10 ? 2 : 0;

    let sum = vigilantes+respect+money+trainers;
    if(gang.length - sum > 2)
    {
        if(layingLow)
        {
            vigilantes+=2;
            sum -= 2;
        }
        else if(ganginfo.wantedPenalty > 0.5)
        {
            respect++;
            money++;
        }
    }
    if(verbose) ns.tprint(`${sum}/${gang.length}  vigi ${vigilantes}  respect ${respect}  money ${money}  train ${trainers}  threat ${threat}`)
    for(const g of gang) {
        if(respect > 0)
        {
            ns.gang.setMemberTask(g, TASK_RESPECT);
            if(ns.gang.getMemberInformation(g).respectGain <= 0.02) ns.gang.setMemberTask(g, TASK_BASIC);
            respect--;
            continue;   
        }
        if(vigilantes > 0)
        {
            ns.gang.setMemberTask(g, TASK_WANTED);
            vigilantes--;
            continue;
        }
        if(money > 0)
        {
            if(ganginfo.wantedPenalty > 0.98) ns.gang.setMemberTask(g, TASK_MONEY2);
            else ns.gang.setMemberTask(g, TASK_MONEY);
            if(ns.gang.getMemberInformation(g).moneyGain <= 1000) ns.gang.setMemberTask(g, TASK_BASIC);
            money--;
            continue;
        }
        if(layingLow || trainers > 0)
        {
            const val = Math.floor(Math.random()*3);
            ns.gang.setMemberTask(g, TASK_TRAIN[val]);
            trainers--;
            continue;
        }
        if(ganginfo.wantedPenalty > 0.95)
        {
            ns.gang.setMemberTask(g, TASK_MONEY2)
            if(ns.gang.getMemberInformation(g).moneyGain <= 1000) ns.gang.setMemberTask(g, TASK_BASIC);
        }
        else ns.gang.setMemberTask(g, TASK_BASIC);
        
    }
    return available;
}

function recruit(ns: NS): void {
    if(ns.gang.canRecruitMember()) {
        shuffleArray(names);
        for(const name of names) {
            if(!ns.gang.getMemberNames().includes(name)) {
                if(ns.gang.recruitMember(name)) {
                    ns.toast(`Recruited new gang member ${name}`);
                    ns.gang.setMemberTask(name, "Train Combat");
                    return;
                }
                else
                {
                    ns.tprint(`Failed recruiting gang member ${name}!`);
                    return;
                }
            }
        }
        
    }
}

function otherGangThreat(ns: NS) {
    let maxThreat = 0;
    const mygang = ns.gang.getGangInformation();
    const other = ns.gang.getOtherGangInformation();
    for(const name in other)
    {
        if(name == mygang.faction) { continue; }
        maxThreat = Math.max(maxThreat, other[name].power);
    }
    if(mygang.power > 2*maxThreat) return false;
    return true;
}

function clashHappened(clashdata: GangOtherInfo, clashcache: GangOtherInfo) {
    for(const name in clashdata)
    {
        if(clashdata[name].power != clashcache[name].power) return true;
        if(clashdata[name].territory != clashcache[name].territory) return true;
    }
}

export async function main(ns : NS) : Promise<void> {
    const args = ns.flags([
        ["help", false],
        ["info", false],
        ["aug", false],
        ["verbose", false]
    ]);

    const equip = getEquip(ns);
    const tasks = getTasks(ns);

    if(args.info) {
        ns.tprint(tasks);
        ns.tprint(ns.gang.getGangInformation());
        return;
    }

    let layingLow = false;

    let clashcounter = 0;   
    let clashcache = ns.gang.getOtherGangInformation();
    while(true) {
        recruit(ns);
        const clashdata = ns.gang.getOtherGangInformation();
        if(clashHappened(clashdata, clashcache))
        {
            clashcounter = 0;
            clashcache = clashdata;
        } else {clashcounter++;}

        const ganginfo = ns.gang.getGangInformation();
        const war = ganginfo.territoryClashChance > 0;

        let members = ns.gang.getMemberNames();
        shuffleArray(members);

        if(clashcounter == 0) {

            if(!layingLow && ganginfo.wantedPenalty < 0.92)
            {
                ns.toast(`Gang laying low!`);
                layingLow = true;
            }
            if(layingLow && ganginfo.wantedPenalty > 0.96)
            {
                layingLow = false;
                ns.toast(`Gang no longer laying low!`);
            }

            members = basicTrain(ns, members);
            if(args.verbose) ns.tprint(`members trained ${members.length}`)
            members = basicAscend(ns, members);
            if(!args.aug) {
                members = basicEquip(ns, members, equip);
            }
            members = advTrain(ns, members);
            if(args.verbose) ns.tprint(`members adv trained ${members.length}`)
            members = basicTask(ns, members, tasks, layingLow, war, args.verbose);
        }
        if(clashcounter == 19)
        {
            if(war) {
                if(ganginfo.territory >= 1) ns.gang.setTerritoryWarfare(false)
                else
                {
                    if(otherGangThreat(ns)) ns.gang.setTerritoryWarfare(false);
                    else ns.gang.setTerritoryWarfare(true);
                }
            }
            else
            {
                if(ganginfo.territory < 1 && !otherGangThreat(ns)) ns.gang.setTerritoryWarfare(true);
            }

            members = basicWar(ns, members);
        }
        await ns.sleep(1000);
    }
}