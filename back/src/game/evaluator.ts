import { Attribute, Branch, DecisionOption, DiceBonus, DiceCheck, GigNode, NodeId } from "../types/GigDefault";
import {
  DecisionOption as EvaluatedDecisionOption,
  DiceCheck as EvaluatedDiceCheck,
  GigNode as EvaluatedGigNode
} from "../types/GigFront";
import { StateManager } from "./state";
import { safeEval } from "../utils/safeEval";


export class Evaluator {
  private state: StateManager

  constructor(state: StateManager) {
    this.state = state;
  }



  public evaluateNode(node: GigNode): EvaluatedGigNode {
    const decision = node.decision?.map(this.evaluateDecision).filter(i => i !== undefined);
    return {
      text: node.text,
      decision
    };
  }

  evaluateDecision(decision: DecisionOption, id: number): EvaluatedDecisionOption | undefined {
    if (decision.condition && !this.evaluate(decision.condition))
      return undefined;
    return {
      text: decision.text,
      cost: decision.cost,
      dice: decision.dice ? this.evaluateDiceCheck(decision.dice) : undefined,
      decisionId: id,
    };
  }


  public evaluateBranchNode(branch: Branch): NodeId {
    const result = this.evaluate(branch.switch);
    return branch[result] ?? branch.default;
  }

  public evaluateDiceCheck(dice: DiceCheck): EvaluatedDiceCheck {
    const bonuses = dice.bonuses
      ?.map(this.evaluateDiceBonus)
      .filter(i => i !== undefined) ?? [];

    const totalBonus = bonuses?.reduce(
      (sum, b) => sum + b.amount, 0
    );

    return {
      dice: dice.dice,
      target: dice.target,
      bonuses: bonuses,
      bonus: totalBonus,
      retries: dice.retries,
    };
  }

  evaluateDiceBonus(bonus: DiceBonus) {
    if (bonus.type === 'characterAttribute') {
      const amount = this.getAttribute(bonus.attribute) || 0;
      return { ...bonus, amount };
    }
    if (bonus.type === 'condition' && this.evaluate(bonus.condition)) {
      return { amount: bonus.amount, text: bonus.text };
    }
  }

  getAttribute(attr: Attribute) {
    return this.state.getVar("character", attr) || 0;
  }

}
