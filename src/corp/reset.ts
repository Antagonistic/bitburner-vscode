import { NS } from '@ns'
import { resetProduction } from '/corp/warehouse'

export async function main(ns : NS) : Promise<void> {
    const args = ns.flags([
        ["test", false],
        ["report", false],
        ["all", false]
    ]);

    for(const proc of ns.ps())
    {
        if(proc.filename == "corp.js") ns.kill(proc.pid);
    }

    await resetProduction(ns, args.report, args.all);
    ns.toast(`Corp reset complete!`);
}