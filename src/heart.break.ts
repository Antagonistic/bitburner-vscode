import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    ns.tprint(`Karma: ${ns.heart.break().toFixed(2)}`);
}