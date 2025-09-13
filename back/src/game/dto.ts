import { Attribute, DiceBonus, DiceCheck, GigNode } from "../types/GigDefault";
import { DiceCheck as EvaluatedDiceCheck, GigNode as EvaluatedGigNode } from "../types/GigDto";
import { StateManager } from "./state";


export class Evaluator {
  private state: StateManager

  constructor(state: StateManager) {
    this.state = state;
  }

  public evaluateNode(node: GigNode): EvaluatedGigNode {
    const evaluateDiceCheck = (dice: DiceCheck) => this.evaluateDiceCheck(dice)
    return evaluateNode(node, evaluateDiceCheck);
  }

  public evaluateDiceCheck(dice: DiceCheck): EvaluatedDiceCheck {
    const getAttribute = (attr: Attribute) => this.state.getVar("character", attr) || 0;
    const evaluate = (code: string) => this.state.evaluate(code);

    return evaluateDiceCheck(dice, getAttribute, evaluate);
  }

}


export function evaluateNode(node: GigNode, evaluateDiceCheck: (dice: DiceCheck) => EvaluatedDiceCheck): EvaluatedGigNode {
  return {
    text: node.text,
    decision: node.decision
      ?.map((decision) => ({
        text: decision.text, cost: decision.cost,
        dice: decision.dice ? evaluateDiceCheck(decision.dice) : undefined,
      }))
  };
}

export function evaluateDiceCheck(
  dice: DiceCheck,
  getAttribute: (attr: Attribute) => number,
  evaluate: (code: string) => boolean,
): EvaluatedDiceCheck {
  let totalBonus = 0;

  function evaluateBonus(bonus: DiceBonus) {
    if (bonus.type === 'characterAttribute') {
      const amount = getAttribute(bonus.attribute) || 0;
      totalBonus += amount;
      return { ...bonus, amount };
    }
    if (bonus.type === 'condition' && evaluate(bonus.condition)) {
      totalBonus += bonus.amount;
      return { amount: bonus.amount, text: bonus.text };
    }
    return undefined;
  }


  const bonuses = dice.bonuses
    ?.map(evaluateBonus)
    .filter(i => i !== undefined);

  return {
    dice: dice.dice,
    target: dice.target,
    bonuses: bonuses,
    bonus: totalBonus,
    retries: dice.retries,
  };
}
