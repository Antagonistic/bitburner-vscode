import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    ns.disableLog("getServerMoneyAvailable");
	ns.disableLog("sleep");

	let cnt = 10;
	const maxram = 8;
	const maxlevel = 80;
	const maxlevel2 = 121;
	const maxcpu = 2;
	let level = 0;
	let ram = 0;
	let cpu = 0;
	const step = 5;
	const wall = 50;
	const sleeptimer = 10000;

	ns.print(`There are ${ns.hacknet.numNodes()}, seeking ${cnt}`)

	while(ns.hacknet.numNodes() < cnt) {
		const cost = ns.hacknet.getPurchaseNodeCost();
		if(ns.getServerMoneyAvailable("home") > cost) {
            const res = ns.hacknet.purchaseNode();
            ns.print("Purchased hacknet Node with index " + res);
		}
		else {
			ns.print("Need $" + cost + " . Have $" + ns.getServerMoneyAvailable("home"));
			await ns.sleep(sleeptimer);
		}
	}

	if(ns.hacknet.numNodes() > cnt) cnt = ns.hacknet.numNodes();

	level = ns.hacknet.getNodeStats(0).level;
	ram = ns.hacknet.getNodeStats(0).ram;
	cpu = ns.hacknet.getNodeStats(0).cores;
	for(let i = 1; i<cnt; i++)
	{
		level = Math.min(level, ns.hacknet.getNodeStats(i).level);
		ram = Math.min(ram, ns.hacknet.getNodeStats(i).ram);
		cpu = Math.min(cpu, ns.hacknet.getNodeStats(i).cores);
	}

	ns.print(`Upgrading node levels to ${maxlevel}, current ${level}`)

	while(level < maxlevel) {
		for(let i = 0; i<cnt; i++)
		{
			if(ns.hacknet.getNodeStats(i).level > level){
				continue;
			}
			const cost = ns.hacknet.getLevelUpgradeCost(i, step);
			while(ns.getServerMoneyAvailable("home") < cost*wall)
			{
				await ns.sleep(sleeptimer);
			}
			ns.hacknet.upgradeLevel(i,step);
			ns.print(`Upgraded hacknet node ${i} to level ${level+step}`);
		}
		level += step;
	}

	ns.print(`Upgrading node ram to ${maxram}, current ${ram}`);

	while(ram < maxram) {
		for(let i = 0; i<cnt; i++)
		{
			if(ns.hacknet.getNodeStats(i).ram > ram){
				continue;
			}
			const cost = ns.hacknet.getRamUpgradeCost(i, 1);
			while(ns.getServerMoneyAvailable("home") < cost*wall)
			{
				await ns.sleep(sleeptimer);
			}
			ns.hacknet.upgradeRam(i,1);
			ns.print(`Upgraded hacknet node ${i} to ram ${ram*2}`);
		}
		ram=ram*2;
	}

	ns.print(`Upgrading node cores to ${maxcpu}, current ${cpu}`)

	while(cpu < maxcpu) {
		for(let i = 0; i<cnt; i++)
		{
			if(ns.hacknet.getNodeStats(i).cores > cpu){
				continue;
			}
			const cost = ns.hacknet.getCoreUpgradeCost(i, 1);
			while(ns.getServerMoneyAvailable("home") < cost*wall)
			{
				await ns.sleep(sleeptimer);
			}
			ns.hacknet.upgradeCore(i,1);
			ns.print(`Upgraded hacknet node ${i} to cores ${cpu+1}`);
		}
		cpu += 1;
	}

	ns.print(`Upgrading node levels to ${maxlevel2}, current ${level}`)

	while(level < maxlevel2) {
		for(let i = 0; i<cnt; i++)
		{
			if(ns.hacknet.getNodeStats(i).level > level){
				continue;
			}
			const cost = ns.hacknet.getLevelUpgradeCost(i, step);
			while(ns.getServerMoneyAvailable("home") < cost*wall)
			{
				await ns.sleep(sleeptimer);
			}
			ns.hacknet.upgradeLevel(i,step);
			ns.print(`Upgraded hacknet node ${i} to level ${level+step}`);
		}
		level += step;
	}

	ns.print("Hacknet upgrades complete");
	ns.toast("Hacknet upgrades complete");
}