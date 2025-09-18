import { useEffect, useState } from "react";
import { decide, getGigGame } from "../backends.ts";
import { GameResult, NodeText } from "../../../back/src/types/front/gigFrontTypes.ts";
import { DecisionDice } from "./DecisionDice.tsx";


export default function Game(props: { gameId: string }) {
  const { gameId } = props;
  const [game, setGame] = useState<GameResult | undefined>(undefined);

  // Fetch GigNode on mount
  useEffect(() => {
    (async () => {
      const game = await getGigGame(gameId);
      setGame(game);
    })();
  }, []);

  const handleDecision = async (index?: number, retry?: boolean) => {
    const { game: nextGame } = await decide(gameId, game!.node.nodeId, index, retry);
    setGame(nextGame);
  };

  if (!game) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <GameView game={game} handleDecision={handleDecision}/>
      <div>
        <h3>State</h3>
        <pre>{JSON.stringify(game.state, null, 2)}</pre>
      </div>
    </div>
  );
}


export function GameView({ game, handleDecision }: {
  game: GameResult,
  handleDecision: (decisionIndex?: number, retry?: boolean) => void
}) {
  if (!game) return <div>No node available</div>;

  return (
    <div style={{ flex: 1, padding: "1rem", overflow: "auto" }}>

      {game.history.history.map((nodeId, historyIndex) =>
        game.history.nodes[nodeId] && (
        <div key={historyIndex}>
          <DialogLine nodeText={game.history.nodes[nodeId]}/>
          <hr/>
        </div>
      ))}

      <hr/>
      {game.node.text && <DialogLine nodeText={game.node.text}/>}

      {/* Decisions */}
      {game.node.decision && (
        <div style={{ marginTop: "1rem" }}>
          {game.node.decision.map((option) => (
            option ?
              (
                <div key={option.decisionId}
                     style={{ border: "1px solid #444", padding: "0.5rem", marginBottom: "0.5rem" }}>
                  <button onClick={() => handleDecision(option.decisionId)}>
                    {option.text}
                  </button>

                  {option.cost && (
                    <div style={{ fontSize: "0.8rem" }}>
                      Cost: {option.cost.amount} {option.cost.type}
                      {option.cost.type === "item" && ` (Item ID: ${option.cost.itemId})`}
                    </div>
                  )}

                  {option.dice &&
                    <DecisionDice dice={option.dice}
                                  handleRetry={(retry: boolean) => handleDecision(option.decisionId, retry)}/>
                  }
                </div>
              ) : (
                <div>
                  <em>Decision option not available due to unmet conditions.</em>
                </div>
              )
          ))}
        </div>
      )}

      {!game.node.decision && (
        <button onClick={() => handleDecision(undefined)}>
          Continue...
        </button>
      )}
    </div>

  );
}


function DialogLine({ nodeText }: { nodeText: NodeText[] }) {
  return nodeText.map((line, i) => (
    <p key={i}>
      <strong>{line.from}: </strong>
      {Array.isArray(line.text) ? line.text.join(" ") : line.text}
    </p>
  ))
}
