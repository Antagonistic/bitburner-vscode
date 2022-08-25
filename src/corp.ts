import { NS } from '@ns'
import * as Corp from '/corp/lib/corp'
import { initDivisions, productCycle } from '/corp/divisionOps';
import { DoWarehouseUpgrades, optimizeProduction, ScoreWarehouseUpgrades } from '/corp/warehouse';
import { DoOfficeSizeUpgrades, ScoreOfficeSizeUpgrades } from '/corp/hr';

const WALL = 10;

export async function main(ns : NS) : Promise<void> {
    const args = ns.flags([
        ["test", false],
        ["report", false],
        ["create", false],
        ["noup", false]
    ]);

    if(!ns.getPlayer().hasCorporation) // no corp, create one
    {
        if(ns.getServerMoneyAvailable("home") > 150e9) // can afford to self-fund
        {
            if(ns.corporation.createCorporation(Corp.CORP_NAME, true))
            {
                ns.tprint(`Corporation ${Corp.CORP_NAME} created!`);
            }
            else
            {
                ns.tprint(`Failed creating corp!`);
            }
        }
        else
        {
            ns.tprint(`Need more funds to create corp!`);
            return;
        }
    }

    if(args.test)  ns.tprint(`Corp init Division`);
    //ns.tprint(ns.corporation.getUnlockables());
    if(!ns.corporation.hasUnlockUpgrade("Warehouse API"))
        ns.corporation.unlockUpgrade("Warehouse API");
    /*if(!ns.corporation.hasUnlockUpgrade("Office API"))
        ns.corporation.unlockUpgrade("Office API");*/
    initDivisions(ns);

    while(true) {

        if(!args.noup)
        {
            if(args.test) ns.tprint(`Scoring upgrades`);
            const warehouseScores = {};
            const officesizeScores = {};
            for(const division of ns.corporation.getCorporation().divisions)
            {
                warehouseScores[division.name] = ScoreWarehouseUpgrades(ns, division.name);
                officesizeScores[division.name] = ScoreOfficeSizeUpgrades(ns, division.name);
            }
            
            if(args.report)
            {
                const cash = ns.corporation.getCorporation().funds;
                for(const division of ns.corporation.getCorporation().divisions)
                {
                    const div = division.name;
                    ns.tprint(`
        Division ${div}
            Warehouse  : score ${warehouseScores[div][1]} affordable ${(cash-warehouseScores[div][0]>0)} cost ${warehouseScores[div][0].toFixed(0)}
            OfficeSize : score ${officesizeScores[div][1]} affordable ${(cash-officesizeScores[div][0]>0)} cost ${officesizeScores[div][0].toFixed(0)}
        `);
                }
            }
            else
            {
                for(const division of ns.corporation.getCorporation().divisions)
                {
                    const div = division.name;
                    {
                        const cash = ns.corporation.getCorporation().funds;    
                        const cost = warehouseScores[div][0];
                        const score = warehouseScores[div][1];
                        if(score > 0 && cost < cash && cost*(WALL-score) < cash)
                            DoWarehouseUpgrades(ns, div);
                    }
                    {
                        const cash = ns.corporation.getCorporation().funds;    
                        const cost = officesizeScores[div][0];
                        const score = officesizeScores[div][1];
                        if(score > 0 && cost < cash && cost*(WALL-score) < cash)
                            DoOfficeSizeUpgrades(ns, div);
                    }
                }
            }
        }


        if(args.test) ns.tprint(`Corp product cycle`);
        productCycle(ns);

        if(args.test) ns.tprint(`Corp optimize warehouse`);
        await optimizeProduction(ns, args.report);

        if(!args.test && !args.report) await ns.sleep(10000);

        if(args.report || args.test) break;
    }

    
    ns.tprint(`Corp script complete`);
}