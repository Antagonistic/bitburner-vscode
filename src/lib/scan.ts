import { NS } from '@ns'

export function scan(ns: NS, parent: string, server: string, list: string[]) : void {
    const children = ns.scan(server);
    for (const child of children) {
        if (parent == child) {
            continue;
        }
        list.push(child);
        
        scan(ns, server, child, list);
    }
}

export function recursiveScan(ns: NS, parent: string, server: string, target: string, route: string[]): boolean {
    const children = ns.scan(server);
    for (const child of children) {
        if (parent == child) {
            continue;
        }
        if (child == target) {
            route.unshift(child);
            route.unshift(server);
            return true;
        }
        if (recursiveScan(ns, server, child, target, route)) {
            route.unshift(server);
            return true;
        }
    }
    return false;
}

export function list_servers(ns: NS): string[] {
    const list = [];
    scan(ns, '', 'home', list);
    return list;
}

export function list_open_servers(ns: NS): string[] {
    const list = [];
    scan(ns, '', 'home', list);
    return list.filter(s=>ns.hasRootAccess(s));
}