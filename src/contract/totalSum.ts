import { NS } from '@ns'

export function totalWaysToSum(data: number): number {
    const k = data;

    const dp = Array.from({ length: data + 1 }, (_, i) => 0);
    dp[0] = 1;

    for (let row = 1; row < k + 1; row++) {
        for (let col = 1; col < data + 1; col++) {
            if (col >= row) {
                dp[col] = dp[col] + dp[col - row];
            }
        }
    }
    return (dp[data] - 1);
}