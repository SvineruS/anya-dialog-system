import type { GigNode, State } from "../../back/src/types/GigFront.ts";
import { GigGame } from "../../back/src/game/gigGame";
import { gig } from "../../back/src/gigs/gig1.ts";

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

const initialState = {
  character: {
    strength: 10,
    dexterity: 7,
    intelligence: 6,
    charisma: 7,
    reputation: 8,

    credits: 50,
    // health: 10,
    // streetCred: 0,
    // maxHealth: 10,
  },
  inventory: {},
  globalState: {},
  gigState: {},
}


const gigGame = new GigGame(gig, initialState);
export type Game = {node: GigNode, nodeId: string, state: State}

export async function getGigGame(): Promise<Game> {
  const res = gigGame.getGame()
  const game = { node: res.evaluatedNode, nodeId: res.nodeId, state: res.state };
  console.log(game)
  return game;
}

export async function decide(nodeId: string, decisionIndex?: number) {
   gigGame.decide(nodeId, decisionIndex);
  return { game: await getGigGame() };
}
