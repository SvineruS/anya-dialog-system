import {
  Action,
  Action_ModifyState,
  Attribute,
  DecisionOption,
  DiceBonus,
  DiceCheck,
  GigGraph,
  GigNode,
  NodeId,
  State
} from "../types/GigDefault";
import { StateManager } from "./state";
import { DecisionOption as EvaluatedDecisionOption, DiceCheck as EvaluatedDiceCheck } from "../types/GigFront";
import { safeEval } from "../utils/safeEval";
import { Evaluator } from "./evaluator";

class GigGame {
  gigGraph: GigGraph;
  state: StateManager;
  private currentNodeId: NodeId;

  constructor(gig: GigGraph, initialState: any) {
    this.gigGraph = gig;
    this.state = new StateManager(initialState);
    this.currentNodeId = Object.keys(gig)[0];
  }

  getGame() {
    const currentNode = new GigCurrentNode(this, this.currentNodeId);
    return {
      state: this.state.getState(),
      node: currentNode.show(),
    };

  }

  makeDecision(nodeId: NodeId, decisionIndex?: number) {
    if (nodeId !== this.currentNodeId)
      throw new Error(`nodeId mismatch. Current node is "${this.currentNodeId}"`);

    const currentNode = new GigCurrentNode(this, this.currentNodeId);
    const nextNodeId = currentNode.decide(decisionIndex);
    this.advanceToNextNode(nextNodeId);
  }


  skipNodesWithoutUI(nodeId: NodeId) {
    while (true) {
      const node = new GigCurrentNode(this, nodeId);
      if (node.canBeShown())
        return nodeId;

      nodeId = node.getNextNode();
    }
  }


  evaluate(statement: string, additionalState = {}): any {
    const state = {...this.state.getState(), ...additionalState};

    const { result, readLog, error } = safeEval(statement, state);
    if (error) {
      console.warn(`Error evaluating "${statement}": ${error}`, { readLog, state });
    }
    return result;
  }

  checkCondition(condition?: string) {
    if (!condition) return true;
    return this.evaluate(condition);
  }

  getAttribute(attr: Attribute) {
    return this.state.getVar("character", attr) || 0;
  }

  doActions(actions: Action[]) {
    actions.forEach((action) => {
      if (action.type === 'setVar') {
        this.doAction_setStateVar(action);
      } else {
        throw new Error(`Unknown action type: ${action.type}`);
      }
    });
  }

  private doAction_setStateVar(action: Action_ModifyState) {
    const [stateType, key] = action.var.split('.', 2) as [keyof State, string];
    if (stateType !== 'globalState' && stateType !== 'gigState')
      throw new Error(`State ${stateType} not found/allowed`);

    if (action.set !== undefined) {
      this.state.setVar(stateType, key, action.set);
    } else if (action.add !== undefined) {
      this.state.addVar(stateType, key, action.add)
    } else {
      throw new Error(`Action must have either set or add defined.`);
    }
  }


}

class GigCurrentNode {
  game: GigGame;
  nodeId: NodeId;
  inner: GigNode;


  constructor(gigGame: GigGame, nodeId: NodeId) {
    this.game = gigGame;
    this.nodeId = nodeId;
    this.inner = this.game.gigGraph[nodeId];
  }

  decide(decisionIndex?: number) {
    let nextNodeId: NodeId;

    if (this.inner.decision) {
      if (!decisionIndex)
        throw new Error(`Decision index must be provided for nodes with decisions.`);

      const decision = new GigDecision(this, decisionIndex);
      const result = decision.makeDecision();
      nextNodeId = result.nextNodeId;
    } else {
      if (decisionIndex !== undefined)
        throw new Error(`Current node has no decisions, cannot provide a decision index.`);

      nextNodeId = this.getNextNode();
    }

    return nextNodeId

  }

  canBeShown() {
    return !!(this.inner.text || this.inner.decision);
  }

  show() {
    return {
      nodeId: this.nodeId,
      text: this.inner.text,
      decision: this.inner.decision
        ?.map((_, idx) => new GigDecision(this, idx).show())
        .filter(i => i !== undefined),
    };
  }

  getNextNode(): NodeId {
    if (this.inner.branch) {
      const branch = this.inner.branch;
      const result = this.game.evaluate(branch.switch);
      return branch[result] ?? branch.default;
    } else if (this.inner.next)
      return this.inner.next;
    else
      throw new Error('Current node has no decisions, branches, or next node to proceed to.');
  }
}

class GigDecision {
  node: GigCurrentNode;
  decisionId: number;
  inner: DecisionOption;

  constructor(node: GigCurrentNode, decisionId: number) {
    this.node = node;
    this.decisionId = decisionId;
    const inner = this.node.inner.decision?.[this.decisionId];
    if (!inner)
      throw new Error(`Invalid decision index: ${decisionId}`);
    this.inner = inner;
  }

  makeDecision(): {nextNodeId: NodeId} {
    if (!this.node.game.checkCondition(this.inner.condition))
      throw new Error(`Decision condition not met for decision index ${this.decisionId}.`);

    if (this.inner.cost) // Handle costs if applicable
      this.payCost(decision.cost);



    if (this.inner.dice) {
      const diceCheck = new GigDiceCheck(this);
      return diceCheck.roll();
    } else if (this.inner.next) {
      return {nextNodeId: this.inner.next};
    } else {
      throw new Error('Decision has no dice check or next node to proceed to.');
    }
  }

  show(): EvaluatedDecisionOption | undefined {
    if (this.node.game.checkCondition(this.inner.condition))
      return undefined;

    return {
      decisionId: this.decisionId,
      text: this.inner.text,
      cost: this.inner.cost,
      dice: this.inner.dice ? new GigDiceCheck(this).show() : undefined,
    };
  }

}

class GigDiceCheck {
  decision: GigDecision;
  inner: DiceCheck;
  diceId: string;


  constructor(decision: GigDecision) {
    this.decision = decision;
    if (!this.decision.inner.dice)
      throw new Error('Dice roll can only be made for decisions with a dice check.');
    this.inner = this.decision.inner.dice;

    this.diceId = `dice_${this.decision.node.nodeId}_${this.decision.decisionId}`;
  }

  roll(): { nextNodeId: string; rollResult?: any } {
    const alreadyWin = this.game().state.getVar("gigState", this.diceId);
    if (alreadyWin) {
      // If already won, skip the roll and go to success
      return {nextNodeId: this.inner.success};
    }

    const rollResult = this.rollDices();


    let nextNodeId: NodeId;

    if (rollResult.isSuccess) {
      // Mark this dice as won, so next time it auto-wins
      this.game().state.setVar("gigState", this.diceId, 1);

      nextNodeId = this.inner.success;
    } else {
      if (this.inner.penalty)
        this.game().doActions(this.inner.penalty);

      nextNodeId = this.inner.fail;
    }

    return { nextNodeId, rollResult};

  }

  show(): EvaluatedDiceCheck {
    const { bonuses, totalBonus } = this.getBonuses();
    return {
      dice: this.inner.dice,
      target: this.inner.target,
      bonuses,
      bonus: totalBonus,
      retries: this.inner.retries,
    };
  }








  private rollDices() {
    const [numDice, diceSides] = this.inner.dice;
    const {rolls, total: rollValue} = this.rollDices_(numDice, diceSides);

    const { totalBonus } = this.getBonuses();
    const isSuccess = (rollValue + totalBonus) >= this.inner.target;
    return { rolls, rollValue, isSuccess };
  }



  private getBonuses() {
    const bonuses = this.inner.bonuses
      ?.map(this.evaluateOneDiceBonus)
      .filter(i => i !== undefined) ?? [];

    const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);
    return { bonuses, totalBonus };
  }


  private evaluateOneDiceBonus(bonus: DiceBonus) {
    if (bonus.type === 'characterAttribute') {
      const amount = this.game().getAttribute(bonus.attribute) || 0;
      return { ...bonus, amount };
    }
    if (bonus.type === 'condition') {
      if (this.game().evaluate(bonus.condition, ))
        return { amount: bonus.amount, text: bonus.text };
    }
  }


  private rollDices_(numDice: number, diceSides: number) {
    const rolls = [];
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      const rand = Math.floor(Math.random() * diceSides) + 1
      rolls.push(rand);
      total += rand;
    }
    return { rolls, total };
  }

  game() {
    return this.decision.node.game;
  }

}
