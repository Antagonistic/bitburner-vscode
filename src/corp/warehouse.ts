import { NS, Product } from '@ns'
import * as Bedurndurn from '/corp/Bedurndurn'
import * as Corp from '/corp/lib/corp'

const productionNames = ["Hardware", "Robots", "AI Cores", "Real Estate"]

const productionWeight = {
    // Hardware, Robotics, AI Core, realEstate
     "Energy": [0, 0.05, 0.3, 0.65],
     "Utilities": [0, 0.4, 0.4, 0.5],
     "Agriculture": [0.2, 0.3, 0.3, 0.72],
     "Fishing": [0.35, 0.5, 0.2, 0.15],
     "Mining": [0.4, 0.45, 0.45, 0.3],
     "Food": [0.15, 0.3, 0.25, 0.05],
     "Tobacco": [0.15, 0.2, 0.15, 0.15],
     "Chemical": [0.2, 0.25, 0.2, 0.25],
     "Pharmaceutical": [0.15, 0.25, 0.2, 0.05],
     "Computer": [0, 0.36, 0.19, 0.2],
     "Robotics": [0.19, 0, 0.36, 0.32],
     "Software": [0.25, 0.05, 0.18, 0.15],
     "Healthcare": [0.1, 0.1, 0.1, 0.1],
     "RealEstate": [0.05, 0.6, 0.6, 0]
}

const productionSize = [0.06, 0.5, 0.1, 0.005];

export function ScoreWarehouseUpgrades(ns: NS, div: string): number[]
{
    const division = ns.corporation.getDivision(div);
    let cost = 0;
    let scoremult = 1;
    for(const city of division.cities)
    {
        cost+=ns.corporation.getUpgradeWarehouseCost(div, city, 2);
    }
    const city = division.cities[0];
    const ware = ns.corporation.getWarehouse(div, city);
    
    if(ware.sizeUsed > ware.size*3/4) scoremult+=1;
    if(ware.sizeUsed > ware.size*0.9) scoremult+=4;
    if(!division.makesProducts) scoremult++;
    if(ware.size < 1000) scoremult+=2;
    if(ware.size > 5000) scoremult/=2;
    if(ware.size > 50000) scoremult=0;
    if(ware.sizeUsed < ware.size/8) scoremult=0;
    
    let score = 1;
    if(division.lastCycleRevenue < 1e6) score = 5
    else if(division.lastCycleRevenue > 1e9) score = 1;
    else score = 2;

    return [cost, score*scoremult];
}

export function DoWarehouseUpgrades(ns: NS, div: string): void
{
    ns.toast(`Upgrading warehouses for ${div}`);
    const division = ns.corporation.getDivision(div);
    let biggest = 0;
    let misMatch = false;
    for(const city of division.cities)
    {
        const ware = ns.corporation.getWarehouse(div, city);
        if(ware.size > biggest)
            biggest = ware.size;
        if(ware.size != biggest) misMatch = true;
    }
    for(const city of division.cities)
    {
        const ware = ns.corporation.getWarehouse(div, city);
        if(misMatch && ware.size < biggest) ns.corporation.upgradeWarehouse(div, city, 1)
        if(!misMatch) ns.corporation.upgradeWarehouse(div, city, 1)
    }
}

function optimizeProductionWeights(ns : NS, industry: string, space: number): number[] {
    const industryWeights = productionWeight[industry];
    
    const sW = [0, 0 ,0 ,0]
    sW[0] = industryWeights[0]/productionSize[0];
    sW[1] = industryWeights[1]/productionSize[1];
    sW[2] = industryWeights[2]/productionSize[2];
    sW[3] = industryWeights[3]/productionSize[3];    
    const total = sW[0]+sW[1]+sW[2]+sW[3];

    sW[0] = sW[0]/total;
    sW[1] = sW[1]/total;
    sW[2] = sW[2]/total;
    sW[3] = sW[3]/total;
    return [Math.floor(space*sW[0]/productionSize[0]), Math.floor(space*sW[1]/productionSize[1]), Math.floor(space*sW[2]/productionSize[2]), Math.floor(space*sW[3]/productionSize[3])];
}

async function buyShortage(ns: NS, short: number, i: number, div:string, city: string): void
{
    //ns.tprint(`Buying? ${short} ${productionNames[i]} for ${div} ${city}`);
    if(short < -100) {
        const ware = ns.corporation.getWarehouse(div, city);
        if((ware.size - ware.sizeUsed) > 2*short) {
            if(ns.corporation.hasResearched(div, Corp.RESEARCH_BULK))
            {
                ns.corporation.bulkPurchase(div, city, productionNames[i], Math.abs(short));
            }
            else
            {
                const realShort = Math.floor(Math.abs(short/10));
                const mat = ns.corporation.getMaterial(div, city, productionNames[i]);
                const current = mat.qty;
                if(mat.sCost == 1) { ns.corporation.sellMaterial(div, city, productionNames[i], 0, "MP");}
                ns.corporation.setSmartSupply(div, city, false);
                ns.corporation.buyMaterial(div, city, productionNames[i], realShort);
                let breakout = 0;
                while(ns.corporation.getMaterial(div,city,productionNames[i]).qty == current)
                {
                    await ns.sleep(50);
                    breakout++;
                    //if(breakout % 100 == 0) ns.tprint(`Waiting on ${ns.corporation.getMaterial(div,city,productionNames[i]).qty} to change from ${current}, waited ${breakout*50}`);
                    if(breakout > 200*15) break; // something wrong, waited 20s
                }
                //ns.tprint(`Bought ${short} ${productionNames[i]} for ${div} ${city}`);
                ns.corporation.buyMaterial(div, city, productionNames[i], 0);
                ns.corporation.setSmartSupply(div, city, true);
                //ns.tprint(`${div} ${productionNames[i]} has ${current} now has ${ns.corporation.getMaterial(div,city,productionNames[i]).qty}`);
            }
        }
    } else if(short > 500)
    {
        ns.corporation.sellMaterial(div, city, productionNames[i], "MAX", 1);
    }
}

async function buyShortageArr(ns: NS, shortArr: number[], div:string, city: string): void
{
    const ware = ns.corporation.getWarehouse(div, city);
    const bulk = ns.corporation.hasResearched(div, Corp.RESEARCH_BULK);
    if(bulk)
    {
        for(let i = 0; i< 4; i++)
        {
            const short = shortArr[i];
            if(short < 0)
            {
                ns.corporation.bulkPurchase(div, city, productionNames[i], Math.min(Math.abs(short), 10000));
            }
            if(short > 500)
            {
                if(ns.corporation.hasResearched(div, Corp.RESEARCH_TA2))
                {
                    ns.corporation.setMaterialMarketTA1(div, city, productionNames[i], false);
                    ns.corporation.setMaterialMarketTA2(div, city, productionNames[i], false);
                }
                ns.corporation.sellMaterial(div, city, productionNames[i], "MAX", 1);
            }
            else
                ns.corporation.sellMaterial(div, city, productionNames[i], 0, 1);
        }
    }
    else
    {
        const current = [0,0,0,0];
        let wait = false;
        ns.corporation.setSmartSupply(div, city, false);
        for(let i = 0; i< 4; i++)
        {
            const short = shortArr[i];
            const mat = ns.corporation.getMaterial(div, city, productionNames[i]);
            if(mat.sCost == 1 && mat.sell == "MAX") { ns.corporation.sellMaterial(div, city, productionNames[i], 0, "MP");}
            current[i] = mat.qty;

            if(short < -100) {
                if((ware.size - ware.sizeUsed) > -2*short) {
                    const realShort = Math.min(Math.floor(Math.abs(short/10)), 10000);
                    ns.corporation.buyMaterial(div, city, productionNames[i], realShort);
                    wait = true;
                }
                ns.corporation.sellMaterial(div, city, productionNames[i], 0, 1);
            }
            else if(short>500)
            {
                ns.tprint(`Selling? ${shortArr[i]} ${productionNames[i]} for ${div} ${city}`);
                if(ns.corporation.hasResearched(div, Corp.RESEARCH_TA2))
                {
                    ns.corporation.setMaterialMarketTA1(div, city, productionNames[i], false);
                    ns.corporation.setMaterialMarketTA2(div, city, productionNames[i], false);
                }
                ns.corporation.sellMaterial(div, city, productionNames[i], "MAX", 1);
            }
        }
        if(wait)
        {
            ns.tprint(`Buying? ${shortArr} for ${div} ${city}`);
            let breakout = 0;
            while(
                ns.corporation.getMaterial(div,city,productionNames[0]).qty == current[0] &&
                ns.corporation.getMaterial(div,city,productionNames[1]).qty == current[1] &&
                ns.corporation.getMaterial(div,city,productionNames[2]).qty == current[2] &&
                ns.corporation.getMaterial(div,city,productionNames[3]).qty == current[3])
            {
                await ns.sleep(50);
                breakout++;
                //if(breakout % 100 == 0) ns.tprint(`Waiting on ${ns.corporation.getMaterial(div,city,productionNames[i]).qty} to change from ${current}, waited ${breakout*50}`);
                if(breakout > 200*15) 
                {
                    ns.tprint(`Broke out of buyShortageArr(${div},${city})!`);
                    break; // something wrong, waited 20s
                }
            }
            for(let i = 0; i< 4; i++)
            {
                ns.corporation.buyMaterial(div, city, productionNames[i], 0);   
            }
        }
        ns.corporation.setSmartSupply(div, city, true);
    }
}

function calcInputOutputSize(ns: NS, div: string, city: string, report: boolean) {
    const division = ns.corporation.getDivision(div);
    const ware = ns.corporation.getWarehouse(div, city);
    let outputSize = 0;
    for(const mat of Corp.IndustryOutput[division.type])
    {
        const _mat = ns.corporation.getMaterial(div, city, mat);
        outputSize += _mat.prod*Corp.MaterialSizes[mat]*10;
        //ns.tprint(`${div} ${city} outputs ${_mat.prod*10} ${mat} at size ${(_mat.prod*Corp.MaterialSizes[mat]*10).toFixed(0)}`)
    }
    //if(outputSize > 0) ns.tprint(`${div} ${city} needs ${outputSize.toFixed(0)} space for products, has ${ware.size}`);
    if(outputSize > ware.size/3)
    {
        if(report)
        {
            ns.tprint(`${div} ${city} does not have enough room for ${outputSize.toFixed(0)} output!`);
        }
        else
        {
            ns.corporation.upgradeWarehouse(div, city, 2);
        }
    }
}

function getProductionSpace(space: number): number
{
    if(space < 1000) return space*0.5;  
    if(space < 5000) return (500 + (space-1000)*0.4);
    return 500+4000*0.4+(space-5000)*0.25;
}

export async function optimizeProduction(ns: NS, report: boolean) : void
{
    for(const div of ns.corporation.getCorporation().divisions) {
        for(const city of div.cities) {
            //if(ns.corporation.getCorporation().funds < 100e6 && !report) { return; }
            if(ns.corporation.hasWarehouse(div.name, city))
            {
                const ware = ns.corporation.getWarehouse(div.name, city);
                if(!report) resetSales(ns, div.name, city);
                if(ware.size <= 300) ns.corporation.upgradeWarehouse(div.name, city, 2);
                calcInputOutputSize(ns, div.name, city, report);
                if(ware.sizeUsed < 0.75*ware.size || report) // Don't change overfilled warehouses
                {
                    //const productionAmounts = optimizeProductionWeights(ns, div.type, ware.size/2);
                    const space = getProductionSpace(ware.size);
                    //ns.tprint(space);
                    const productionAmounts = Bedurndurn.productionMultiplier(ns, div.type, space);
                    productionAmounts.forEach((x,i) => {
                        productionAmounts[i] = Math.floor(productionAmounts[i]*space/(100*productionSize[i]));
                    })
                    //ns.tprint(productionAmounts);
                    const short = [0, 0, 0, 0]
                    short [0] = Math.floor(ns.corporation.getMaterial(div.name, city, productionNames[0]).qty - productionAmounts[0]);
                    short [1] = Math.floor(ns.corporation.getMaterial(div.name, city, productionNames[1]).qty - productionAmounts[1]);
                    short [2] = Math.floor(ns.corporation.getMaterial(div.name, city, productionNames[2]).qty - productionAmounts[2]);
                    short [3] = Math.floor(ns.corporation.getMaterial(div.name, city, productionNames[3]).qty - productionAmounts[3]);
                    if(Corp.IndustryOutput[div.type].includes(productionNames[0])) short[0] = 0;
                    if(Corp.IndustryOutput[div.type].includes(productionNames[1])) short[1] = 0;
                    if(Corp.IndustryOutput[div.type].includes(productionNames[2])) short[2] = 0;
                    if(Corp.IndustryOutput[div.type].includes(productionNames[3])) short[3] = 0;
                    if(Corp.IndustryInput[div.type].includes(productionNames[0])) short[0] = 0;
                    if(Corp.IndustryInput[div.type].includes(productionNames[1])) short[1] = 0;
                    if(Corp.IndustryInput[div.type].includes(productionNames[2])) short[2] = 0;
                    if(Corp.IndustryInput[div.type].includes(productionNames[3])) short[3] = 0;
                    //ns.tprint(`${div.name} ${city} ${ware.size/2} current: ${ware.sizeUsed.toFixed(0)}/${ware.size} short of ${short[0].toFixed(0)}/${productionAmounts[0]} ${short[1].toFixed(0)}/${productionAmounts[1]} ${short[2].toFixed(0)}/${productionAmounts[2]} ${short[3].toFixed(0)}/${productionAmounts[3]}`)
                    if(report)
                    {
                        let oversupply = 0;
                        if(short[0] > 0) oversupply += short[0] * productionSize[0];
                        if(short[0] > 0) oversupply += short[0] * productionSize[0];
                        if(short[0] > 0) oversupply += short[0] * productionSize[0];
                        if(short[0] > 0) oversupply += short[0] * productionSize[0];
                        if(oversupply > 10) ns.tprint(`Total oversupply of ${oversupply.toFixed(0)} size`)
                    }
                    if(!report) {
                        //await buyShortage(ns, short[0], 0, div.name, city);
                        //await buyShortage(ns, short[1], 1, div.name, city);
                        //await buyShortage(ns, short[2], 2, div.name, city);
                        //await buyShortage(ns, short[3], 3, div.name, city);
                        await buyShortageArr(ns, short, div.name, city);
                    }
                }
            }
        }
    }
}

function useSmartLeftovers(ns: NS, div: string, city: string): void
{
    for(const mat of Corp.Materials) {
        ns.corporation.setSmartSupplyUseLeftovers(div, city, mat, true);
    }
    ns.corporation.setSmartSupply(div, city, true);
}

function resetMaterial(ns: NS, div: string, city: string, mat: string): void
{
    ns.corporation.buyMaterial(div, city, mat, 0);
    if(ns.corporation.getMaterial(div, city, mat).qty > 0) 
        ns.corporation.sellMaterial(div, city, mat, "MAX", 1)
    else
        ns.corporation.sellMaterial(div, city, mat, 0, 1)
}

function buyAdvert(ns: NS, div: string)
{
    const cash = ns.corporation.getCorporation();
    const cost = ns.corporation.getHireAdVertCost(div);
    if(cash > cost*10) ns.corporation.hireAdVert(div);
}

export function resetSales(ns: NS, div: string, city: string): void {
    const division = ns.corporation.getDivision(div);
    const products = division.products;
    const mats = Corp.IndustryOutput[division.type];
    let needAd = false;
    for(const mat of mats)
    {
        const _mat = ns.corporation.getMaterial(div, city, mat);
        const prodMat = Corp.ProductionMaterials.includes(mat)
        if(_mat.prod*0.99 > _mat.sell) needAd = true;
        //ns.tprint(`${div} ${city} resetting sales of ${mat}`);
        ns.corporation.buyMaterial(div, city, mat, 0);
        if(prodMat) ns.corporation.sellMaterial(div, city, mat, "PROD", "MP");
        else ns.corporation.sellMaterial(div, city, mat, "MAX", "MP");
        if(ns.corporation.hasResearched(div, Corp.RESEARCH_TA2))
        {
            if(prodMat)
            {
                ns.corporation.setMaterialMarketTA1(div, city, mat, false);    
                ns.corporation.setMaterialMarketTA2(div, city, mat, false);
            }
            else
            {
                if(_mat.prod*0.99 > _mat.sell){
                    //ns.tprint(`Overproduction on ${div} ${city}, setting TA`);
                    ns.corporation.setMaterialMarketTA1(div, city, mat, true);    
                    ns.corporation.setMaterialMarketTA2(div, city, mat, false);
                }
                else
                {
                    ns.corporation.setMaterialMarketTA1(div, city, mat, false);
                    ns.corporation.setMaterialMarketTA2(div, city, mat, true);
                }
            }
        }
        else if(ns.corporation.hasResearched(div, Corp.RESEARCH_TA1) && !prodMat) ns.corporation.setMaterialMarketTA1(div, city, mat, true);
    }
    for(const prod of products) {
        //ns.tprint(`${div} ${city} resetting sales of ${prod}`);
        ns.corporation.sellProduct(div, city, prod, "MAX", "MP");
        if(ns.corporation.hasResearched(div, Corp.RESEARCH_TA2))
        {
            ns.corporation.setProductMarketTA1(div, prod, false);
            ns.corporation.setProductMarketTA2(div, prod, true);
        }
        else if(ns.corporation.hasResearched(div, Corp.RESEARCH_TA1)) ns.corporation.setProductMarketTA1(div, prod, true);
    }
    if(needAd) buyAdvert(ns, div);
}

export async function resetProduction(ns: NS, report: boolean, all: boolean) : void
{
    for(const div of ns.corporation.getCorporation().divisions) {
        for(const city of div.cities) {
            if(ns.corporation.hasWarehouse(div.name, city))
            {
                const ware = ns.corporation.getWarehouse(div.name, city);
                if(!report) ns.corporation.setSmartSupply(div.name, city, false);
                if(!report) resetSales(ns, div.name, city);
                if(ware.sizeUsed > 0.75*ware.size) // Reset overfilled warehouses
                {
                    let sz = 0;
                    sz += ns.corporation.getMaterial(div.name, city, productionNames[0]).qty*productionSize[0];
                    sz += ns.corporation.getMaterial(div.name, city, productionNames[1]).qty*productionSize[1];
                    sz += ns.corporation.getMaterial(div.name, city, productionNames[2]).qty*productionSize[2];
                    sz += ns.corporation.getMaterial(div.name, city, productionNames[3]).qty*productionSize[3];
                    ns.tprint(`Warehouse near max ${div.name} ${city} ${ware.sizeUsed.toFixed(0)}/${ware.size} with mats size ${sz.toFixed(0)}`)
                    if(!report)
                    {
                        ns.corporation.buyMaterial(div.name, city, productionNames[0], 0);
                        ns.corporation.buyMaterial(div.name, city, productionNames[1], 0);
                        ns.corporation.buyMaterial(div.name, city, productionNames[2], 0);
                        ns.corporation.buyMaterial(div.name, city, productionNames[3], 0);
                    }
                    if(sz > (ware.size/2+20) || all) {
                        if(report) ns.tprint(`Overfilled warehouse ${div.name}, ${city}`)
                        else
                        {
                            resetMaterial(ns, div.name, city, productionNames[0])
                            resetMaterial(ns, div.name, city, productionNames[1])
                            resetMaterial(ns, div.name, city, productionNames[2])
                            resetMaterial(ns, div.name, city, productionNames[3])
                        }
                    }
                    else
                    {
                        if(!report) {
                            ns.tprint(`Upgrading warehouse at ${div.name} ${city}`)
                            ns.corporation.upgradeWarehouse(div.name, city, 1);
                        }
                    }
                }
                if(!report) useSmartLeftovers(ns, div.name, city);
            }
        }
    }
}