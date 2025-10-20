import { DiceCheck } from "../../../back/src/GigSystem/types/front/gigFrontTypes.ts";


export function DecisionDice({ dice, handleRetry }: {
  dice: DiceCheck
  handleRetry: (retry: boolean) => void
}) {
  const chance = probabilityXdYGreaterThanTarget(dice.dice[0], dice.dice[1], dice.target - dice.bonus)
  const chanceStr = (chance * 100).toFixed(2);

  return (
    <div className="mt-2 p-3 rounded-xl border text-sm">
      <div className="font-bold mb-1">🎲 Dice Check</div>
      <div>Success chance: {chanceStr} %</div>
      {dice.isAlreadyWon && <div style={{ color: "green" }}>✅ Already succeeded </div>}

      {
        dice.lastResult &&
        <div> Last Roll: {dice.lastResult.rolls.join(", ")} {dice.lastResult.isSuccess ?
          <span style={{ color: "green" }}>✅ Success</span> :
          <span style={{ color: "red" }}>❌ Failure</span>}
        </div>
      }


      {
        dice.retries.pendingRetry &&
        <div>
          Accept lose or retry for {dice.retries.retryCost} credits
          <button onClick={() => handleRetry(true)} style={{ marginLeft: "1rem" }}>Retry</button>
          <button onClick={() => handleRetry(false)} style={{ marginLeft: "1rem" }}>Accept Lose</button>
        </div>
      }


      <ul>
        {dice.bonuses.map((b, i) => (
          <li key={i}>
            {"attribute" in b ? `Attribute bonus for ${b.attribute.toUpperCase()}` : `${b.text}`}
            {b.amount > 0 ?
              (<span style={{ color: "green" }}> +{b.amount} </span>) :
              (<span style={{ color: "red" }}>  {b.amount} </span>)
            }
          </li>
        ))}
      </ul>

      <div>Total Bonus: +{dice.bonus}</div>
      <div>Target {dice.target}</div>
      <div> Dice: {dice.dice[0]}d{dice.dice[1]}      </div>

      <div>Retries left: {dice.retries.maxRetries - dice.retries.retriesDone}</div>
      <div>Retry cost: {dice.retries.retryCost}</div>

    </div>
  );
}


function probabilityXdYGreaterThanTarget(x: number, y: number, target: number) {
  // DP approach: count number of ways to get each sum
  const dp: { [k: number]: number }[] = Array.from({ length: x + 1 }, () => ({}));
  dp[0][0] = 1; // base case: 0 dice = 1 way to get sum 0

  for (let dice = 1; dice <= x; dice++) {
    for (const [sumStr, count] of Object.entries(dp[dice - 1])) {
      const sum = parseInt(sumStr, 10);
      for (let face = 1; face <= y; face++) {
        const newSum = sum + face;
        dp[dice][newSum] = (dp[dice][newSum] || 0) + count;
      }
    }
  }

  // total outcomes
  const total = Math.pow(y, x);

  // favorable outcomes: sums > target
  let favorable = 0;
  for (const [sumStr, count] of Object.entries(dp[x])) {
    const sum = parseInt(sumStr, 10);
    if (sum > target) favorable += count;
  }

  return favorable / total;
}
