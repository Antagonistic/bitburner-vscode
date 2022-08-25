import { Division, NS } from '@ns'
import * as Corp from '/corp/lib/corp'
import { assignJobs } from '/corp/hr';

function expandIndustry(ns: NS, industry: string, cash: number): boolean
{
    const cost = ns.corporation.getExpandIndustryCost(industry)
    if(cost < cash*2)
    {
        const divName = Corp.IndustryStrings[industry][0];
        ns.corporation.expandIndustry(industry, divName);
        cash -= cost;
    }
    else
    {
        ns.tprint(`Not enough funds to expand to industry ${industry}`);
    }
}

function expandDivisions(ns: NS, industry = ""): boolean
{
    const corp = ns.corporation.getCorporation();
    const cash = corp.funds;
    const divisions = corp.divisions;
    let success = true;
    if(industry)
    {
        if(!expandIndustry(ns, industry, cash))
            success = false;
    }
    for(const starter of Corp.StartIndustries)
    {
        if(!divisions.map(x=>x.type).includes(starter))
        {   
            if(!expandIndustry(ns, starter, cash))
            {
                success = false;
            }
        }
    }
    return success;
}

function setSellProduct(ns: NS, div: string): void {
    const division = ns.corporation.getDivision(div);
    for(const prod of division.products) {
        //ns.tprint(`${div} ${city} resetting sales of ${prod}`);
        for(const city of division.cities)
            ns.corporation.sellProduct(div, city, prod, "MAX", "MP");
        if(ns.corporation.hasResearched(div, Corp.RESEARCH_TA2))
        {
            ns.corporation.setProductMarketTA1(div, prod, false);
            ns.corporation.setProductMarketTA2(div, prod, true);
        }
        else if(ns.corporation.hasResearched(div, Corp.RESEARCH_TA1)) ns.corporation.setProductMarketTA1(div, prod, true);
    }
}

export function productCycle(ns: NS): void
{
    for(const division of ns.corporation.getCorporation().divisions)
    {
        if(division.makesProducts)
        {
            const div = division.name;
            const products = division.products;
            let minProd = 0;
            let worst;
            let inProgress = false;
            let maxNumber = 0;
            for(const prodName of products)
            {
                const prod = ns.corporation.getProduct(div, prodName);
                if(!worst || prod.rat<minProd)
                {
                    worst = prod;
                    minProd = prod.rat;
                }
                if(prod.developmentProgress < 100) inProgress = true;
                const prodNumber = parseInt(prod.name.slice(Corp.IndustryStrings[division.type][1].length));
                if(prodNumber && prodNumber > maxNumber) maxNumber = prodNumber;
            }
            if(inProgress) continue;
            if(products.length == 3 && worst)
            {
                ns.corporation.discontinueProduct(div, worst.name);
            }
            const amount = Math.floor(ns.corporation.getCorporation().funds/100); // 1% of funds into product
            const name = Corp.IndustryStrings[division.type][1] + (maxNumber+1);
            ns.corporation.makeProduct(div, Corp.CITIES[0], name, amount, amount);

            setSellProduct(ns, div);
        }
    }
}

export function initDivisions(ns: NS, industry = ""): boolean
{
    let success = expandDivisions(ns, industry);

    const corp = ns.corporation.getCorporation();
    let cash = corp.funds;
    const divisions = corp.divisions;
    
    for(const division of divisions)
    {
        const div = division.name;
        if(division.cities.length < 6)
        {
            for(const city of Corp.CITIES)
            {
                if(!division.cities.includes(city))
                {
                    if(cash > 2*ns.corporation.getExpandCityCost()+ 5e9)
                    {
                        ns.corporation.expandCity(div, city);
                        cash -= ns.corporation.getExpandCityCost();

                        ns.corporation.purchaseWarehouse(div, city);
                    }
                    else
                    {
                        ns.tprint(`Not enough cash to expand division ${div} to more cities!`);
                        success = false;
                    }
                }
            }
        }
        for(const city of division.cities) 
        {
            if(!ns.corporation.hasWarehouse(div, city) && cash > ns.corporation.getPurchaseWarehouseCost())
            {
                ns.corporation.purchaseWarehouse(div, city);
                cash -= ns.corporation.getPurchaseWarehouseCost();
            }
                else success = false;
            const office = ns.corporation.getOffice(div, city);
            if(office.size < 9)
            {
                const cost = ns.corporation.getOfficeSizeUpgradeCost(div, city, 9-office.size);
                if(cash < cost)
                {
                    ns.corporation.upgradeOfficeSize(div, city, 9-office.size);
                    cash -= cost;
                }
            }
            assignJobs(ns, div, city);
        }
    }
    return success;
}