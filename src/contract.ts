import { NS } from '@ns'
import { list_servers } from '/lib/scan'
import { RLEncoding } from './contract/RLE'
import { arrayJumping } from './contract/ArrayJump'
import { sanitizeParentheses } from './contract/sanitizeParentheses'
import { solveTotalSumTwo } from './contract/totalSumTwo'
import { totalWaysToSum } from './contract/totalSum'
import { twoColorGraph } from './contract/twoColorGraph'
import { LZCompression } from './contract/LZCompression'
import { Caesar } from './contract/Caesar'
import { spiral } from './contract/spiral'
import { UniqueGridPathsII } from '/contract/UniqueGridPathsII'
import { largestPrime } from '/contract/largestPrime'
import { LZDecompression } from '/contract/LZDecompression'
import { StockTraderI } from '/contract/StockTraderI'
import { StockTraderII } from '/contract/StockTraderII'
import { StockTraderIII } from '/contract/StockTraderIII'
import { MinimumPathTriangle } from '/contract/MinimumPathTriangle'
import { SubarrayMaxSum } from '/contract/SubarrayMaxSum'

function contract_solve(ns: NS, contract_type: string | number | string[], contract_data: any): string | string[] | number | number[] | false {
    switch(contract_type) {
        case "Total Ways to Sum":
        return totalWaysToSum(contract_data);

        case "Total Ways to Sum II":
        return solveTotalSumTwo(ns, contract_data);

        case "Sanitize Parentheses in Expression":
        return sanitizeParentheses(ns, contract_data);

        case "Array Jumping Game":
        return arrayJumping(ns, contract_data) > 0 ? 1: 0;

        case "Array Jumping Game II":
        return arrayJumping(ns, contract_data);

        case "Spiralize Matrix":
        return spiral(contract_data);

        case "Compression I: RLE Compression":
        return RLEncoding(ns, contract_data);

        case "Proper 2-Coloring of a Graph":
        return twoColorGraph(ns, contract_data);

        case "Compression III: LZ Compression":
        return LZCompression(ns, contract_data);

        case "Compression II: LZ Decompression":
        return LZDecompression(ns, contract_data);

        case "Encryption I: Caesar Cipher":
        return Caesar(ns, contract_data);

        case "Unique Paths in a Grid II":
        return UniqueGridPathsII(ns, contract_data);

        case "Find Largest Prime Factor":
        return largestPrime(ns, contract_data);

        case "Algorithmic Stock Trader I":
        return StockTraderI(ns, contract_data);

        case "Algorithmic Stock Trader II":
        return StockTraderII(ns, contract_data);

        case "Algorithmic Stock Trader III":
        return StockTraderIII(ns, contract_data);

        case "Minimum Path Sum in a Triangle":
        return MinimumPathTriangle(ns, contract_data);

        case "Subarray with Maximum Sum":
        return SubarrayMaxSum(ns, contract_data);

        default:
        return false;
    }
}

export async function main(ns : NS) : Promise<void> {
    const args = ns.flags([
        ["help", false],
        ["quiet", false],
        ["display",false],
        ["test",false]
    ]);
	if (args.help) {
		ns.tprint("This script detects hackable targets.");
		ns.tprint(`Usage: run ${ns.getScriptName()}`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()}`);
		return;
	}

    const all_servers = list_servers(ns);
    const open_servers = all_servers.filter(s=>ns.hasRootAccess(s));

	const hostnames = open_servers.filter(s => ns.ls(s).find(f => f.endsWith(".cct")))
    if(!hostnames || hostnames.length == 0){
        ns.tprint(`No code contracts found!`);
		return;
    }
    else
    {
        for(const hostname of hostnames)
        {
            ns.tprint(`Found coding contract on ${hostname}!`);
            const contract_file = ns.ls(hostname).find(f=>f.endsWith(".cct"));
            if(contract_file) {
                contract_process(ns, contract_file, hostname, args);
            }
        }
    }
}

function contract_process(ns: NS, file: string, hostname: string, args: ScriptArg): void {
    const contract_data = ns.codingcontract.getData(file, hostname);
    const contract_type = ns.codingcontract.getContractType(file, hostname);
	ns.tprintf(contract_type);
    const answer = contract_solve(ns, contract_type, contract_data);
    if(args.test)
    {
        ns.tprint(`input   : ${contract_data}`)
        ns.tprint(`answer  : ${answer}`);
        ns.tprint(`attempt : ${ns.codingcontract.getNumTriesRemaining(file, hostname)}`)
        ns.tprint(`answer  : ${answer}`);
        return;
    }
    if(args.display || answer === false) {
        if(!args.quiet) {
            ns.tprint(`Type: ${contract_type} - No solution currently implemented`);
            ns.tprint(`Desc: ${ns.codingcontract.getDescription(file, hostname)}`);
            ns.tprint(`Try : ${ns.codingcontract.getNumTriesRemaining(file, hostname)}`);
            ns.tprint(`Data: ${contract_data}`);
        }
    }
    else
    {

        if(!args.quiet)
        {
            ns.tprint(`input   : ${contract_data}`)
            ns.tprint(`answer  : ${answer}`);
            ns.tprint(`attempt : ${ns.codingcontract.getNumTriesRemaining(file, hostname)}`)
            ns.tprint(ns.codingcontract.attempt(answer, file, hostname, {"returnReward":true}));
        }
        else
        {
            ns.tprint(ns.codingcontract.attempt(answer, file, hostname, {"returnReward":true}));
        }
    }
}