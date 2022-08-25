import { NS } from '@ns'

// Source is https://www.reddit.com/r/Bitburner/comments/swk9ar/comment/hxmtgrh/?utm_source=reddit&utm_medium=web2x&context=3

const MaterialSizes = {
    Water: 0.05,
    Energy: 0.01,
    Food: 0.03,
    Plants: 0.05,
    Metal: 0.1,
    Hardware: 0.06,
    Chemicals: 0.05,
    Drugs: 0.02,
    Robots: 0.5,
    AICores: 0.1,
    RealEstate: 0.005,
    "Real Estate": 0.005,
    "AI Cores": 0.1
};

const ProductionFactors = {
    Energy: {
        reFac: 0.65,
        hwFac: 0,
        robFac: 0.05,
        aiFac: 0.3
    },
    Utilities: {
        reFac: 0.5,
        hwFac: 0,
        robFac: 0.4,
        aiFac: 0.4
    },
    Agriculture: {
        reFac: 0.72,
        hwFac: 0.2,
        robFac: 0.3,
        aiFac: 0.3
    },
    Fishing: {
        reFac: 0.15,
        hwFac: 0.35,
        robFac: 0.5,
        aiFac: 0.2
    },
    Mining: {
        reFac: 0.3,
        hwFac: 0.4,
        robFac: 0.45,
        aiFac: 0.45
    },
    Food: {
        reFac: 0.05,
        hwFac: 0.15,
        robFac: 0.3,
        aiFac: 0.25
    },
    Tobacco: {
        reFac: 0.15,
        hwFac: 0.15,
        robFac: 0.2,
        aiFac: 0.15
    },
    Chemical: {
        reFac: 0.25,
        hwFac: 0.2,
        robFac: 0.25,
        aiFac: 0.2
    },
    Pharmaceutical: {
        reFac: 0.05,
        hwFac: 0.15,
        robFac: 0.25,
        aiFac: 0.2
    },
    Computer: {
        reFac: 0.2,
        hwFac: 0,
        robFac: 0.36,
        aiFac: 0.19
    },
    Robotics: {
        reFac: 0.32,
        hwFac: 0.19,
        robFac: 0,
        aiFac: 0.36
    },
    Software: {
        reFac: 0.15,
        hwFac: 0.25,
        robFac: 0.05,
        aiFac: 0.18
    },
    Healthcare: {
        reFac: 0.1,
        hwFac: 0.1,
        robFac: 0.1,
        aiFac: 0.1
    },
    RealEstate: {
        reFac: 0,
        hwFac: 0.05,
        robFac: 0.6,
        aiFac: 0.6
    }
}

//Pass this function the ns object, your industry type and how much warehouse space you want to fill with production enhancing stuff
//returns an array with the % of space to allocate to each of the 4 materials
export function productionMultiplier(ns: NS, myIndustry: string, size = 1): number[] {

    const percentHeuristic = function (hw, rob, ai, re, industry) {
        // re, hw, rob, ai are % of the warehouse allocated to that product:
        const fact = ProductionFactors[industry];
        let score = Math.pow(0.002 * ((re * size) / MaterialSizes.RealEstate) + 1, fact.reFac);		// Real Estate
        score *= Math.pow(0.002 * ((hw * size) / MaterialSizes.Hardware) + 1, fact.hwFac); //Hardware
        score *= Math.pow(0.002 * ((rob * size) / MaterialSizes.Robots) + 1, fact.robFac); //Robots
        score *= Math.pow(0.002 * ((ai * size) / MaterialSizes.AICores) + 1, fact.aiFac);

        return score;
    }

    // ns.print(`My industry is ${myIndustry}`);
    // ns.print(`Facts are: `);
    // ns.print(ProductionFactors[myIndustry]);

    let score = percentHeuristic(0, 0, 0, 0, myIndustry);
    let best = [0, 0, 0, 0];


    for (let a = 0; a <= 100; a++) {
        for (let b = 100 - a; b >= 0; b--) {
            for (let c = 100 - (a + b); c >= 0; c--) {
                const d = 100 - (a + b + c);
                const myScore = percentHeuristic(a, b, c, d, myIndustry);
                // ns.print(`${a} RE    ${b} HW    ${c} Ro    ${d} AI    = ${myScore}`);
                if (myScore > score) {
                    // ns.print(`New best divide is: ${a} RE    ${b} HW    ${c} Ro    ${d} AI`);
                    best = [a, b, c, d];
                    score = myScore;
                }

            }
        }
    }

    return best;

}