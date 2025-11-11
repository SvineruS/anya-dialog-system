import { DecisionOption } from "../../types/gigStory";
import { RenderedDecisionOption } from "../../types/front/gigFrontTypes";
import { GigNode } from "./node";
import { GigDiceCheck } from "./diceCheck";
import { EvaluatedDecisionData } from "../../types/evaluated";


export class GigDecisionOption {
  readonly node: GigNode;
  readonly decisionId: number;

  readonly decisionOption: DecisionOption;

  constructor(node: GigNode, decisionId: number) {
    this.node = node;
    this.decisionId = decisionId;

    const decisionOption = node.node.decision?.[this.decisionId];
    if (!decisionOption)
      throw new Error(`Invalid decision index: ${decisionId}`);
    this.decisionOption = decisionOption;
  }

  makeDecision() {
    if (!this.checkCondition())
      throw new Error(`Decision condition not met for decision index ${this.decisionId}.`);


    if (this.decisionOption.dice) {
      return this.diceCheck().roll();

    } else if (this.decisionOption.next) {

      // todo don't pay cost if dice.alreadyWon ??  let's just not allow costs on dice decisions for now
      if (this.decisionOption.cost)
        this.game().helpers.payCost(this.decisionOption.cost);

      return { nextNodeId: this.decisionOption.next };

    } else {
      throw new Error('Decision has no dice check or next node to proceed to.');
    }
  }

  evaluate(): EvaluatedDecisionData {
    return {
      conditionMet: this.checkCondition(),
      diceData: this.decisionOption.dice ? this.diceCheck().evaluate() : undefined
    };
  }


  show(decisionData: EvaluatedDecisionData): RenderedDecisionOption | undefined {
    if (!decisionData.conditionMet)
      return undefined;

    const dice = this.decisionOption.dice ?
      this.diceCheck().show(decisionData.diceData!) : undefined;

    return {
      decisionId: this.decisionId,
      text: this.decisionOption.text,
      cost: this.decisionOption.cost,
      dice,
    };
  }


  private checkCondition() {
    return this.game().helpers.checkCondition(this.decisionOption.condition);
  }

  game = () => this.node.game;
  diceCheck = () => new GigDiceCheck(this);
}

