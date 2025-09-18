import {GameService} from "../../back/src/services/gameService"
import { Repository } from "../../back/src/repositories/repository.ts";
import { GameResult } from "../../back/src/types/front/gigFrontTypes.ts";


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


const repository = new Repository();
const gameService = new GameService(repository);


const userId = "user1";



export async function getMissions() {
  const missions = gameService.getMissions(userId);
  console.log(missions)
  return missions;
}

export async function startGigGame(gigId: string) {
  const game = gameService.startGame(userId, gigId);
  console.log(game)
  return game;
}


export async function getGigGame(gameId: string): Promise<GameResult> {
  const game = gameService.showGame(userId, gameId);
  console.log(game)
  return game;
}

export async function decide(gameId: string, nodeId: string, decisionIndex?: number, retry?: boolean): Promise<{game: GameResult, result: any}> {
  console.log("decide", nodeId, decisionIndex, retry);
  const result = gameService.makeDecision(userId, gameId, nodeId, decisionIndex, retry);
  console.log(result)
   return result;
}
