import { NS } from '@ns'
import { IMap } from '/lib/utils'

export const CORP_NAME = "Evil Inc"
export const IND_ORGANIC = "Evil Organic"
export const IND_SOFTWARE = "Evilsoft"

export const RESEARCH_TA1 = "Market-TA.I"
export const RESEARCH_TA2 = "Market-TA.II"
export const RESEARCH_BULK = "Bulk Purchasing"

export const CITIES = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

export const IndustryStrings = {
    "Agriculture": ["Evil Organic", ""],
    "Software": ["Evilsoft", "Evilsoft v"],
    "Tobacco": ["Deathsticks", "Deathsticks "]
}

export const StartIndustries = ["Agriculture"];

export const MaterialSizes: IMap<number> = {
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
    "AI Cores": 0.1,
  };

  export const Materials: string[] = [
    "Water",
    "Energy",
    "Food",
    "Plants",
    "Metal",
    "Hardware",
    "Chemicals",
    "Drugs",
    "Robots",
    "Real Estate",
    "AI Cores"
  ];

  export const ProductionMaterials: string[] = [
    "Hardware",
    "Robots",
    "AI Cores",
    "Real Estate"
  ];

  export const IndustryInput: IMap<string[]> = {
    "Energy": [],
    "Utilities": [],
    "Agriculture": ["Water", "Energy"],
    "Fishing": [],
    "Mining": [],
    "Food": [],
    "Tobacco": ["Plants", "Water"],
    "Chemical": [],
    "Pharmaceutical": [],
    "Computer": [],
    "Robotics": [],
    "Software": ["Energy", "Hardware"],
    "Healthcare": [],
    "RealEstate": [],
  };

  export const IndustryOutput: IMap<string[]> = {
    "Energy": [],
    "Utilities": [],
    "Agriculture": ["Food", "Plants"],
    "Fishing": [],
    "Mining": [],
    "Food": [],
    "Tobacco": [],
    "Chemical": [],
    "Pharmaceutical": [],
    "Computer": [],
    "Robotics": [],
    "Software": ["AI Cores"],
    "Healthcare": [],
    "RealEstate": [],
  };

  // Map of official names for each Industry
export const Industries: IMap<string> = {
    Energy: "Energy",
    Utilities: "Water Utilities",
    Agriculture: "Agriculture",
    Fishing: "Fishing",
    Mining: "Mining",
    Food: "Food",
    Tobacco: "Tobacco",
    Chemical: "Chemical",
    Pharmaceutical: "Pharmaceutical",
    Computer: "Computer Hardware",
    Robotics: "Robotics",
    Software: "Software",
    Healthcare: "Healthcare",
    RealEstate: "RealEstate",
  };
  
  // Map of how much money it takes to start each industry
  export const IndustryStartingCosts: IMap<number> = {
    Energy: 225e9,
    Utilities: 150e9,
    Agriculture: 40e9,
    Fishing: 80e9,
    Mining: 300e9,
    Food: 10e9,
    Tobacco: 20e9,
    Chemical: 70e9,
    Pharmaceutical: 200e9,
    Computer: 500e9,
    Robotics: 1e12,
    Software: 25e9,
    Healthcare: 750e9,
    RealEstate: 600e9,
  };