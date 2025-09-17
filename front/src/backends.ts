import type {State} from "../../back/src/types/GigFront.ts";
import {GigNode as EvaluatedGigNode} from "../../back/src/types/GigFront.ts";
import {GigGame} from "../../back/src/game/gigGame";
import {InitialState} from "../../back/src/types/GigDefault.ts";

// async function getGigNode(): Promise<GigNode> {
//   const res = await fetch("/api/getGame");
//   if (!res.ok) throw new Error("Failed to fetch GigNode");
//   const j = await res.json();
//   return j.evaluatedNode;
// }
//
// async function decide(nodeId: string, decisionIndex: number): Promise<{ result: string; diceRoll?: number }> {
//   const res = await fetch("/api/decision", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ nodeId, decisionIndex }),
//   });
//   if (!res.ok) throw new Error("Decision request failed");
//   return res.json();
// }

const initialState: InitialState = {
  character: {
    strength: 10,
    charisma: 7,
    intelligence: 6,
    marksmanship: 7,
    stealth: 8,

    credits: 50,
    // health: 10,
    // streetCred: 0,
    // maxHealth: 10,
  },
  inventory: {},
  globalState: {},
}


const gigGame = GigGame.createNewGame(initialState, "gig1");
export type Game =  {node: EvaluatedGigNode, state: State}

export async function getGigGame() {
  const game = gigGame.getGame()
  console.log(game)
  return game;
}

export async function decide(nodeId: string, decisionIndex?: number, retry?: boolean) {
   const result = gigGame.makeDecision(nodeId, decisionIndex, retry);
   console.log("decide", nodeId, decisionIndex, retry, result);
   const game = await getGigGame();
   return { game, result  };
}
