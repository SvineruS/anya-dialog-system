import {GigGame} from "./gigGame";

export function rollNDices(numDice: number, diceSides: number) {
  const rolls = [];
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    const rand = Math.floor(Math.random() * diceSides) + 1
    rolls.push(rand);
    total += rand;
  }
  return { rolls, total };
}
