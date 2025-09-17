import {
  DecisionOption,
  DiceBonus,
  DiceCheck,
  GigGraph,
  GigNode,
  InitialState,
  NodeId,
  State
} from "../types/GigDefault";
import {StateManager} from "./gigStateManager";
import {
  GigNode as EvaluatedGigNode,
  DecisionOption as EvaluatedDecisionOption,
  DiceBonus as EvaluatedDiceBonus,
  DiceCheck as EvaluatedDiceCheck
} from "../types/GigFront";
import {rollNDices} from "./utils";
import {GigActionsHelper, GigStateHelper} from "./gigGameHelper";
import {getGigById} from "../gigs";


export class GigGame {
  private readonly state: StateManager;

  readonly stateHelper: GigStateHelper;
  readonly actionsHelper: GigActionsHelper;

  readonly gigId: string;
  readonly gig: GigGraph;

  constructor(state: State) {
    this.state = new StateManager(state);
    this.stateHelper = new GigStateHelper(this.state);
    this.actionsHelper = new GigActionsHelper(this.state);


    this.gigId = state.game.gigId;
    this.gig = getGigById(this.gigId);
  }

  static createNewGame(initialState: InitialState, gigId: string) {
    const gig = getGigById(gigId);
    const currentNodeId = Object.keys(gig)[0];

    const state = {
      character: initialState.character,
      inventory: initialState.inventory ?? {},
      globalState: initialState.globalState ?? {},
      game: { gigId: gigId, currentNodeId },
      gigState: {},
    }

    const game = new GigGame(state);
    game.activateNode(currentNodeId);
    return game;
  }

  getGame(): {node: EvaluatedGigNode, state: State} {
    const currentNodeId = this.stateHelper.currentNodeId().get();
    const currentNode = new GigCurrentNode(this, currentNodeId);

    return {
      state: this.state.getState(),
      node: currentNode.show(),
    };

  }

  makeDecision(nodeId: NodeId, decisionIndex?: number, retry?: boolean) {
    const currentNodeId = this.stateHelper.currentNodeId().get();
    const currentNode = new GigCurrentNode(this, currentNodeId);
    const result = currentNode.makeDecision(nodeId, decisionIndex, retry);

    if (result?.nextNodeId)
      this.activateNode(result.nextNodeId);

    return result;
  }


  private activateNode(nodeId: NodeId) {
    const node = new GigCurrentNode(this, nodeId);

    this.stateHelper.currentNodeId().set(nodeId);
    node.doActions();

    if (node.canBeSkipped())
      this.activateNode(node.getNextNode());

  }

}

class GigCurrentNode {
  readonly game: GigGame;
  readonly nodeId: NodeId;

  readonly node: GigNode;

  readonly pendingRollRetry: number | undefined;

  constructor(gigGame: GigGame, nodeId: NodeId) {
    this.game = gigGame;
    this.nodeId = nodeId;

    this.node = this.game.gig[nodeId];
    if (!this.node)
      throw new Error(`Invalid nodeId: ${nodeId}`);

    this.pendingRollRetry = this.game.stateHelper.pendingRetry().get();
  }

  makeDecision(nodeId: NodeId, decisionIndex?: number, retry?: boolean) {
    if (nodeId !== this.nodeId)
      throw new Error(`nodeId mismatch. Current node is "${this.nodeId}"`);


    // If player failed a dice roll and a retry is pending, handle that first
    if (this.pendingRollRetry !== undefined) {
      if (decisionIndex !== this.pendingRollRetry)
        throw new Error(`A retry is pending for decision index ${this.pendingRollRetry}, must provide that index.`);
      if (retry === undefined)
        throw new Error(`A retry is pending, must provide acceptRetry parameter.`);

      return this.decisionOption(decisionIndex).diceCheck().retry(retry);
    }

    if (this.node.decision) {
      if (decisionIndex === undefined)
        throw new Error(`Decision index must be provided for nodes with decisions.`);

      return this.decisionOption(decisionIndex).makeDecision();

    }

    if (decisionIndex !== undefined)
      throw new Error(`Current node has no decisions, cannot provide a decision index.`);

    const nextNodeId = this.getNextNode();
    return { nextNodeId };
  }


  show(): EvaluatedGigNode {
    return {
      nodeId: this.nodeId,
      text: this.node.text,
      decision: this.node.decision
        ?.map((_, idx) => this.decisionOption(idx).show())
        .filter(i => i !== undefined),
    };
  }


  doActions() {
    if (this.node.actions)
      this.game.actionsHelper.doActions(this.node.actions);
  }

  canBeSkipped() {
    return !this.node.text && !this.node.decision;
  }


  getNextNode(): NodeId {
    if (this.node.branch) {
      const branch = this.node.branch;
      const result = this.game.stateHelper.evaluate(branch.switch);
      return branch[result] ?? branch.default;
    } else if (this.node.next)
      return this.node.next;
    else
      throw new Error('Current node has no decisions, branches, or next node to proceed to.');
  }

  decisionOption = (decisionId: number) => new GigDecisionOption(this, decisionId);
}

class GigDecisionOption {
  readonly node: GigCurrentNode;
  readonly decisionId: number;

  readonly decisionOption: DecisionOption;

  constructor(node: GigCurrentNode, decisionId: number) {
    this.node = node;
    this.decisionId = decisionId;

    const decisionOption = node.node.decision?.[this.decisionId];
    if (!decisionOption)
      throw new Error(`Invalid decision index: ${decisionId}`);
    this.decisionOption = decisionOption;
  }

  makeDecision() {
    if (!this.game().stateHelper.checkCondition(this.decisionOption.condition))
      throw new Error(`Decision condition not met for decision index ${this.decisionId}.`);

    // todo don't pay cost if dice.alreadyWon ?
    if (this.decisionOption.cost) // Handle costs if applicable
      this.game().actionsHelper.payCost(this.decisionOption.cost);

    if (this.decisionOption.dice) {
      return this.diceCheck().roll();
    } else if (this.decisionOption.next) {
      return { nextNodeId: this.decisionOption.next };
    } else {
      throw new Error('Decision has no dice check or next node to proceed to.');
    }
  }

  show(): EvaluatedDecisionOption | undefined {
    if (!this.game().stateHelper.checkCondition(this.decisionOption.condition))
      return undefined;

    return {
      decisionId: this.decisionId,
      text: this.decisionOption.text,
      cost: this.decisionOption.cost,
      dice: this.decisionOption.dice ? new GigDiceCheck(this).show() : undefined,
    };
  }

  game = () => this.node.game;
  diceCheck = () => new GigDiceCheck(this);
}


// todo get default values from gig object by gig tier
const MAX_RETRIES = 2;
const RETRY_COST = 10;

export class GigDiceCheck {
  readonly decision: GigDecisionOption;

  readonly diceCheck: DiceCheck;

  readonly diceId: string;
  readonly alreadyWon: boolean;
  readonly retries: number;
  readonly isThisDicePendingRetry: boolean;


  constructor(decision: GigDecisionOption) {
    this.decision = decision;
    if (!this.decision.decisionOption.dice)
      throw new Error('Dice roll can only be made for decisions with a dice check.');
    this.diceCheck = this.decision.decisionOption.dice;

    this.diceId = `dice_${this.decision.node.nodeId}_${this.decision.decisionId}`;
    this.isThisDicePendingRetry = this.decision.node.pendingRollRetry === this.decision.decisionId;

    this.alreadyWon = this.stateHelper().diceAlreadyWin(this.diceId).get();
    this.retries = this.stateHelper().diceRetriesDone(this.diceId).get() || 0;
  }


  // when roll is failed, call this to decide whether to reroll or accept fail
  retry(retry: boolean) {
    if (!this.isThisDicePendingRetry)
      throw new Error(`No retry is pending for this dice roll.`);

    this.stateHelper().pendingRetry().set(undefined);

    if (!retry) {
      // accept fail
      return { nextNodeId: this.diceCheck.fail };

    } else {
      // try reroll
      if (!this.canRetry())
        throw new Error(`No retries left for this dice roll.`);

      this.stateHelper().diceRetriesDone(this.diceId).add(1);
      // todo - check retries left
      // todo pay some cost

      return this.roll();
    }
  }

  roll() {
    if (this.alreadyWon) { // If already won, skip the roll and go to success
      return { nextNodeId: this.diceCheck.success };
    }

    const [numDice, diceSides] = this.diceCheck.dice;
    const { rolls, total: rollValue } = rollNDices(numDice, diceSides);
    const { totalBonus } = this.getBonuses();

    const isSuccess = (rollValue + totalBonus) >= this.diceCheck.target;
    const rollResult = { rolls, isSuccess };

    this.stateHelper().diceLastResult(this.diceId).set(rollResult);


    if (rollResult.isSuccess) {
      // SUCCESS

      this.stateHelper().diceAlreadyWin(this.diceId).set(true);
      return { nextNodeId: this.diceCheck.success, rollResult };

    } else {
      // FAIL

      // todo: are penalties even needed?
      // if (this.diceCheck.penalty)
      //   this.game().actionsHelper.doActions(this.diceCheck.penalty);

      const canRetry = this.canRetry();
      if (canRetry) {
        // If retries are available, set pending retry and wait for player decision
        this.stateHelper().pendingRetry().set(this.decision.decisionId);
        return { rollResult, canRetry: true };
      }

      return { nextNodeId: this.diceCheck.fail, rollResult, canRetry: false };
    }


  }


  show(): EvaluatedDiceCheck {
    const { bonuses, totalBonus } = this.getBonuses();
    const lastResult = this.stateHelper().diceLastResult(this.diceId).get();
    return {
      dice: this.diceCheck.dice,
      target: this.diceCheck.target,
      isAlreadyWon: this.alreadyWon,
      bonuses,
      bonus: totalBonus,
      retries: {
        maxRetries: this.diceCheck.retries ?? MAX_RETRIES,
        retriesDone: this.retries,
        retryCost: RETRY_COST,
        pendingRetry: this.isThisDicePendingRetry,
      },
      lastResult,
    } as EvaluatedDiceCheck;
  }


  private canRetry() {
    const maxRetries = this.diceCheck.retries ?? MAX_RETRIES;
    return this.retries < maxRetries;
  }


  private getBonuses() {
    const bonuses: EvaluatedDiceBonus[] = this.diceCheck.bonuses
      ?.map((b) => this.evaluateOneDiceBonus(b))
      .filter(i => i !== undefined) ?? [];

    const totalBonus = bonuses.reduce((sum, b) => sum + b!.amount, 0);
    return { bonuses, totalBonus };
  }


  private evaluateOneDiceBonus(bonus: DiceBonus): EvaluatedDiceBonus | undefined {
    if (bonus.type === 'characterAttribute') {
      const amount = this.stateHelper().getAttribute(bonus.attribute) || 0;
      return { ...bonus, amount };
    }
    if (bonus.type === 'condition') {
      if (this.stateHelper().evaluate(bonus.condition))
        return { amount: bonus.amount, text: bonus.text };
    }
  }


  game = () => this.decision.node.game;
  stateHelper = () => this.game().stateHelper;

}
