import { EquipmentStats, NS } from '@ns'

interface IEquip {
    name: string;
    cost: number;
    type: string;
    stats: EquipmentStats;
}

export function getEquip(ns : NS): IEquip[] {
    let equip: IEquip[] = [];
    const names = ns.gang.getEquipmentNames();
    for(const name of names) {
        equip.push({
            name: name,
            cost: ns.gang.getEquipmentCost(name),
            type: ns.gang.getEquipmentType(name),
            stats: ns.gang.getEquipmentStats(name)
        });
    }
    equip = equip.sort((a,b) => a.cost-b.cost);
    return equip;
}