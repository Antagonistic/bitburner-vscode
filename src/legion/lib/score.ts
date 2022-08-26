import { NS } from "@ns";

export interface IScore {
  name: string;
  hackamount: number;
  hackPercent: number;
  maxMoney: number;
  hacktime: number;
  growtime: number;
  weakentime: number;
  maxTime: number;
  hackscore: number;
  growscore: number;
  weakscore: number;
  score: number;
  hackThreads: number;
  growThreads: number;
  weakThreads: number;
}

export function print_score(ns: NS, score: IScore): void {
  ns.tprint(print_score_string(ns, score));
}

export function print_score_string(ns: NS, score: IScore): void {
  return `
  ${score.name}    :
      hackamount    : ${score.hackamount.toFixed(2)}/${score.maxMoney} (${(score.hackPercent*100).toFixed(2)}%)
      hackTime      : ${ns.tFormat(score.hacktime)}   ${((score.hacktime < 2000) ? score.hacktime.toFixed(2)+" ms" : "")}
      growTime      : ${ns.tFormat(score.growtime)}   ${((score.growtime < 2000) ? score.growtime.toFixed(2)+" ms" : "")}
      weakTime      : ${ns.tFormat(score.weakentime)}   ${((score.weakentime < 2000) ? score.weakentime.toFixed(2)+" ms" : "")}
      maxTime       : ${ns.tFormat(score.maxTime)}   ${((score.maxTime < 5000) ? score.maxTime.toFixed(2)+" ms" : "")}
      hackscore     : ${score.hackscore.toFixed(2)}
      growscore     : ${score.growscore.toFixed(2)}
      weakscore     : ${score.weakscore.toFixed(2)}
      score         : ${score.score.toFixed(2)}
      hackThreads   : ${score.hackThreads}
      growThreads   : ${score.growThreads}
      weakThreads   : ${score.weakThreads}
`
}

export function score_servers(ns: NS, servers: string[], cores = 1): IScore[] {
  const ret: IScore[] = [];

  for (const server of servers) {
    const score = score_server(ns, server, cores);
    if (score != null) ret.push(score);
  }

  const sorted = Object.values(ret)
    .sort(function (a, b) {
      return a.score - b.score;
    })
    .reverse();
  return sorted;
}

export function score_server(ns: NS, server: string, cores = 1): IScore | null {
  const hackPercent = 0.05;
  if (ns.fileExists("Formulas.exe", "home")) {
    const maxMoney = ns.getServerMaxMoney(server);
    if (maxMoney <= 0) {
      return null;
    }

    const serv = ns.getServer(server);
    serv.hackDifficulty = serv.minDifficulty;
    serv.moneyAvailable = serv.moneyMax;
    const player = ns.getPlayer();

    const hacktime = ns.formulas.hacking.hackTime(serv, player);
    const growtime = ns.formulas.hacking.growTime(serv, player);
    const weakentime = ns.formulas.hacking.weakenTime(serv, player);
    const maxRam = ns.getServerMaxRam(server);
    if (maxRam == 0 || maxMoney == 0) {
      return null;
    }

    const hackanalyze = ns.formulas.hacking.hackPercent(serv, player);
    const hackamount = hackanalyze * maxMoney;
    const hackchance = ns.formulas.hacking.hackChance(serv, player);

    const maxTime = Math.max(Math.max(hacktime, growtime), weakentime);
    const hackscore = hackchance * hackamount;

    const growscore = Math.min(
      ns.formulas.hacking.growPercent(serv, 50, player, cores),
      2
    );
    const hackThreads = Math.floor(hackPercent / hackanalyze);
    const realHackPercent = hackThreads*hackanalyze;
    const growThreads = Math.ceil(
      ns.growthAnalyze(server, 1 / (1 - realHackPercent), cores)
    );
    const secGain =
        ns.hackAnalyzeSecurity(hackThreads, server) +
        0.004*growThreads*cores;
    const weakscore = 1/secGain * 100;
    let score =
      (10 * hackscore * growscore * weakscore) / (maxTime * maxTime);
    if(maxTime < 10000) score = score/2;
    if(maxTime < 5000) score = score/2;
    if(maxTime < 1000) score = score/2;
    if(hackThreads <= 4) score = score/2;
    if(hackThreads <= 2) score = score/2;
    if(hackThreads <= 1) score = score/2;
   
    const weakThreads = Math.ceil(secGain / ns.weakenAnalyze(1, cores));

    if(hackThreads == 0 || weakThreads == 0 || growThreads == 0) score = 0;

    return {
      name: server,
      hackamount: hackamount,
      hackPercent: realHackPercent,
      maxMoney: maxMoney,
      hacktime: hacktime,
      growtime: growtime,
      weakentime: weakentime,
      maxTime: maxTime,
      hackscore: hackscore,
      growscore: growscore,
      weakscore: weakscore,
      score: score,
      hackThreads: hackThreads,
      growThreads: growThreads,
      weakThreads: weakThreads,
    };
  } else {
    const maxMoney = ns.getServerMaxMoney(server);
    if (maxMoney <= 0) {
      return null;
    }

    const hacktime = ns.getHackTime(server);
    const growtime = ns.getGrowTime(server);
    const weakentime = ns.getWeakenTime(server);
    const maxRam = ns.getServerMaxRam(server);
    if (maxRam == 0 || maxMoney == 0) {
      return null;
    }
    const hackamount = ns.hackAnalyze(server) * maxMoney;
    const hackchance = ns.hackAnalyzeChance(server);

    const maxTime = Math.max(Math.max(hacktime, growtime), weakentime);
    const hackscore = hackchance * hackamount;
    const growscore = 1 / ns.growthAnalyze(server, 1.1);
    const weakscore = ns.weakenAnalyze(1, 1);
    let score =
      (100 * hackscore * hackscore * growscore * weakscore) /
      (maxTime * maxTime);
    if(maxTime < 5000) score = score/2;
    if(maxTime < 1000) score = score/2;

    const hackThreads = Math.floor(hackPercent / ns.hackAnalyze(server));
    const growThreads = Math.ceil(
      ns.growthAnalyze(server, 1 / (1 - hackPercent), cores)
    );
    const secGain =
      ns.hackAnalyzeSecurity(hackThreads, server) +
      ns.growthAnalyzeSecurity(growThreads, server, cores);
    const weakThreads = Math.ceil(secGain / (0.05*cores));

    if(hackThreads == 0 || weakThreads == 0 || growThreads == 0) score = 0;

    return {
      name: server,
      hackamount: hackamount,
      hackPercent: hackPercent,
      maxMoney: maxMoney,
      hacktime: hacktime,
      growtime: growtime,
      weakentime: weakentime,
      maxTime: maxTime,
      hackscore: hackscore,
      growscore: growscore,
      weakscore: weakscore,
      score: score,
      hackThreads: hackThreads,
      growThreads: growThreads,
      weakThreads: weakThreads,
    };
  }
}
