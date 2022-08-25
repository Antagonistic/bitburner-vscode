import { Employee, NS } from '@ns'
import { off } from 'process';
import * as Corp from '/corp/lib/corp'

const JOBS = ["Operations", "Engineer", "Business", "Management", "Research & Development", "Training"]
const skillWeight = {
    // int, cha, exp, cre, eff
    "Operations": [0.6, 0.1, 1, 0.5, 1],
    "Engineer": [1, 0.1, 1.5, 0, 1],
    "Business": [0.4, 1, 1, 0, 0],
    "Management": [0, 2, 1, 0.2, 0.7],
    "Research & Development": [1.5, 0, 0.8, 1, 0.5],
    "Training": [1, 1, 1, 1, 1]
}
const jobWeight = [4, 4, 1, 3, 3, 0];
const jobProductWeight = [5, 5, 1, 4, 0, 0];
const jobnonProductWeight = [4, 3, 1, 3, 4, 0];
const jobWightSum = 4+4+1+3+3;

const MAX_OFFICE = 30

export function ScoreOfficeSizeUpgrades(ns: NS, div: string)
{
    const division = ns.corporation.getDivision(div);
    let cost = 0;
    let score = 1;
    let scoremult = 1;
    for(const city of division.cities)
    {
        if(division.makesProducts && city == Corp.CITIES[0] )
        {
            // production city
            cost+=ns.corporation.getOfficeSizeUpgradeCost(div, city, 6);
        }
        else
            cost+=ns.corporation.getOfficeSizeUpgradeCost(div, city, 3);
    }
    const office = ns.corporation.getOffice(div, division.cities[0]);
    if(office.size < 30) score = 2;
    if(office.size < 15) score = 4;
    if(office.size < 9) score = 8;
    if(division.makesProducts && office.size >= MAX_OFFICE*2) score = 0;
    if(!division.makesProducts && office.size >= MAX_OFFICE) score = 0;

    if(division.lastCycleRevenue < 1e6) scoremult/=2;
    if(division.lastCycleRevenue > 1e9) scoremult*=2;
    return [cost, score*scoremult];
}

export function DoOfficeSizeUpgrades(ns: NS, div: string): void
{
    ns.toast(`Upgrading offices for ${div}`);
    const division = ns.corporation.getDivision(div);
    let biggest = 0;
    let misMatch = false;
    for(const city of division.cities)
    {
        const office = ns.corporation.getOffice(div, city);
        let size = office.size;
        if(division.makesProducts && city == Corp.CITIES[0]) size /= 2;
        if(office.size > biggest)
            biggest = office.size;
        if(office.size != biggest) misMatch = true;
    }
    for(const city of division.cities)
    {
        const office = ns.corporation.getOffice(div, city);
        if(division.makesProducts && city == Corp.CITIES[0])
        {
            if(misMatch && office.size < biggest*2) ns.corporation.upgradeOfficeSize(div, city, 3)
            if(!misMatch) ns.corporation.upgradeOfficeSize(div, city, 6)
        }
        else
        {
            if(misMatch && office.size < biggest*2) ns.corporation.upgradeOfficeSize(div, city, 3)
            if(!misMatch) ns.corporation.upgradeOfficeSize(div, city, 3)
        }
    }
    for(const city of division.cities)
    {
        assignJobs(ns, div, city);
    }
}

function scoreEmp(emp: Employee, job: string)
{
    const w = skillWeight[job];
    return w[0]*emp.int + w[1]*emp.cha + w[2]*emp.exp + w[3]*emp.cre + w[4]*emp.eff;
}

function assignEmployee(ns: NS, div: string, city: string, employees: Employee[], job: string): string[]
{
    let best;
    let bestScore = 0;
    for(const emp of employees)
    {
        const score = scoreEmp(emp, job);
        if(!best || score > bestScore)
        {
            best = emp;
            bestScore = score;
        }
    }
    ns.corporation.assignJob(div, city, best.name, job);
    return employees.filter((x) => x.name != best.name);
}

export function assignJobs(ns: NS, div: string, city: string): void
{
    const division = ns.corporation.getDivision(div);
    const office = ns.corporation.getOffice(div, city);
    if(office.employees.length < office.size)
    {
        const numHire = office.size - office.employees.length;
        for(let i = 0; i< numHire; i++)
        {
            ns.corporation.hireEmployee(div, city);
        }
    }
    const employees = office.employees;
    let _employees = [];
    for(const emp of employees)
    {
        _employees.push(ns.corporation.getEmployee(div, city, emp));
    }
    let assign = [];
    if(division.makesProducts)
    {
        if(city == Corp.CITIES[0]) // Product research city
            assign = jobProductWeight.map((x)=>Math.floor(employees.length*x/jobWightSum));
        else
            assign = jobnonProductWeight.map((x)=>Math.floor(employees.length*x/jobWightSum));
    }
    else
        assign = jobWeight.map((x)=>Math.floor(employees.length*x/jobWightSum));
    if(assign[0] == 0) assign[0] = 1;
    if(assign[1] == 0) assign[1] = 1;
    if(assign[2] == 0) assign[2] = 1;
    
    for(let i = 0; i< assign[0]; i++)
        _employees = assignEmployee(ns, div, city, _employees, JOBS[0]);
    for(let i = 0; i< assign[1]; i++)
        _employees = assignEmployee(ns, div, city, _employees, JOBS[1]);
    for(let i = 0; i< assign[2]; i++)
        _employees = assignEmployee(ns, div, city, _employees, JOBS[2]);
    for(let i = 0; i< assign[3]; i++)
        _employees = assignEmployee(ns, div, city, _employees, JOBS[3]);
    for(let i = 0; i< assign[4]; i++)
        _employees = assignEmployee(ns, div, city, _employees, JOBS[4]);
    for(let i = 0; i<_employees.length; i++)
        _employees = assignEmployee(ns, div, city, _employees, JOBS[4]); // Leftover assign to R&D
}

export function optimizeJobs(ns: NS): void
{
    for(const division of ns.corporation.getCorporation().divisions)
    {
        const div = division.name;
        for(const city of division.cities) 
        {
            assignJobs(ns, div, city);
        }
    }
}