import type { DiceCheck } from "../../back/src/types/GigDto.ts";
import { useEffect, useState } from "react";
import { decide, type Game, getGigGame } from "./backends.ts";

function DiceCard({ dice }: { dice: DiceCheck }) {
  return (
    <div className="mt-2 p-3 rounded-xl border text-sm">
      <div className="font-bold mb-1">🎲 Dice Check</div>
      <div>
        Roll: {dice.dice[0]}d{dice.dice[1]} vs Target {dice.target}
      </div>
      <div>Total Bonus: +{dice.bonus}</div>
      {dice.bonuses && (
        <ul>
          {dice.bonuses.map((b, i) => (
            <li key={i}>
              {"attribute" in b
                ? `${b.attribute} +${b.amount}`
                : `${b.text} (+${b.amount})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function GigNodeView() {
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
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
      {/* Dialogue text */}
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

              {option.dice && <DiceCard dice={option.dice} />}
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
  );
}
