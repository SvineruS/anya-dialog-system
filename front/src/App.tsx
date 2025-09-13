import type { DiceCheck } from "../../back/src/types/GigDto.ts";
import { useEffect, useState } from "react";
import { decide, type Game, getGigGame } from "./backends.ts";

function DiceCard({ dice }: { dice: DiceCheck }) {
  const chance = probabilityXdYGreaterThanTarget(dice.dice[0], dice.dice[1], dice.target - dice.bonus)
  const chanceStr = (chance * 100).toFixed(2);

  return (
    <div className="mt-2 p-3 rounded-xl border text-sm">
      <div className="font-bold mb-1">🎲 Dice Check</div>
      <div>
        Roll: {dice.dice[0]}d{dice.dice[1]} vs Target {dice.target}
      </div>
      <div>Total Bonus: +{dice.bonus}</div>
      <div>Success chance: {chanceStr} %</div>

      {dice.bonuses && (
        <ul>
          {dice.bonuses.map((b, i) => (
            <li key={i}>
              {"attribute" in b ? `Attribute bonus for ${b.attribute.toUpperCase()}` : `${b.text}`}
              {b.amount > 0 ?
                (<span style={{color: "green"}}> +{b.amount} </span>) :
                (<span style={{color: "red"}}>  {b.amount} </span>)
              }
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function GigNodeView() {
  const [prevText, setPrevText] = useState<any[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  // Fetch GigNode on mount
  useEffect(() => {
    (async () => {
      try {
        const game = await getGigGame();
        setGame(game);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDecision = async (index?: number) => {
    setRolling(true);
    try {
      const { game: nextGame } = await decide(game!.nodeId, index);
      if (game!.node.text) { // @ts-ignore
        setPrevText((prev) => [...prev, ...game!.node.text])
      }
      setGame(nextGame);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRolling(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>No node available</div>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, padding: "1rem", overflow: "auto" }}>
        {prevText?.map((line, i) => (
          <p key={i}>
            <strong>{line.from}: </strong>
            {Array.isArray(line.text) ? line.text.join(" ") : line.text}
          </p>
        ))}

        <hr/>
        {game.node.text?.map((line, i) => (
          <p key={i}>
            <strong>{line.from}: </strong>
            {Array.isArray(line.text) ? line.text.join(" ") : line.text}
          </p>
        ))}

        {/* Decisions */}
        {game.node.decision && (
          <div style={{ marginTop: "1rem" }}>
            {game.node.decision.map((option, i) => (
              <div key={i} style={{ border: "1px solid #444", padding: "0.5rem", marginBottom: "0.5rem" }}>
                <button onClick={() => handleDecision(i)} disabled={rolling}>
                  {option.text}
                </button>

                {option.cost && (
                  <div style={{ fontSize: "0.8rem" }}>
                    Cost: {option.cost.amount} {option.cost.type}
                    {option.cost.type === "item" && ` (Item ID: ${option.cost.itemId})`}
                  </div>
                )}

                {option.dice && <DiceCard dice={option.dice}/>}
              </div>
            ))}
          </div>
        )}

        {!game.node.decision && (
          <button onClick={() => handleDecision(undefined)} disabled={rolling}>
            Continue...
          </button>
        )}
      </div>
      <div>
        <h3>Character</h3>
        <pre>{JSON.stringify(game.state.character, null, 2)}</pre>

        <h3>Inventory</h3>
        <pre>{JSON.stringify(game.state.inventory, null, 2)}</pre>

        <h3>Gig State</h3>
        <pre>{JSON.stringify(game.state.gigState, null, 2)}</pre>

        <h3>Global State</h3>
        <pre>{JSON.stringify(game.state.globalState, null, 2)}</pre>
      </div>
    </div>
  );
}


function probabilityXdYGreaterThanTarget(x: number, y: number, target: number) {
  // DP approach: count number of ways to get each sum
  const dp: {[k: number]: number}[] = Array.from({ length: x + 1 }, () => ({}));
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
