import { DiceBonus, DiceCheck } from "../../types/gigStory";
import { EngineState } from "../../types/state";
import { EvaluatedDiceData, EvaluatedDiceBonus, DecisionReturnType, RollResult } from "../../types/evaluated";
import { RenderedDiceCheck as RenderedDiceCheck, } from "../../types/front/gigFrontTypes";
import { GigDecisionOption } from "./decisionOption";


// todo get default values from gig object by gig tier
const MAX_RETRIES = 2;
const RETRY_COST = 10;

export class GigDiceCheck {
  readonly decision: GigDecisionOption;
  readonly diceCheck: DiceCheck;
  readonly diceId: string;


  constructor(decision: GigDecisionOption) {
    this.decision = decision;
    if (!this.decision.decisionOption.dice)
      throw new Error('Dice roll can only be made for decisions with a dice check.');
    this.diceCheck = this.decision.decisionOption.dice;

    this.diceId = `dice[${this.decision.node.nodeId}_${this.decision.decisionId}]`;
  }


  // when roll is failed, call this to decide whether to reroll or accept fail
  retry(retry: boolean): DecisionReturnType {
    if (!this.isThisDicePendingRetry())
      throw new Error(`No retry is pending for this dice roll.`);

    this.setPendingRetry(false);

    if (!retry) {
      // accept fail
      return { nextNodeId: this.diceCheck.fail };

    } else {
      // try reroll
      if (!this.canRetry())
        throw new Error(`No retries left for this dice roll.`);

      this.incrementRetriesDone();
      this.game().helpers.payCost({ type: 'credits', amount: RETRY_COST });

      return this.roll();
    }
  }

  roll() {
    if (this.getDiceAlreadyWon()) { // If already won, skip the roll and go to success
      return { nextNodeId: this.diceCheck.success };
    }

    const [numDice, diceSides] = this.diceCheck.dice;
    const { rolls, total: rollValue } = rollNDices(numDice, diceSides);
    const totalBonus = getTotalBonus(this.getBonuses());

    const isSuccess = (rollValue + totalBonus) >= this.diceCheck.target;
    const rollResult = { rolls, isSuccess };

    this.setLastRollResult(rollResult);


    if (rollResult.isSuccess) {
      // SUCCESS

      this.setDiceAlreadyWon();
      return { nextNodeId: this.diceCheck.success, rollResult };

    } else {
      // FAIL

      // todo: are penalties even needed?
      // if (this.diceCheck.penalty)
      //   this.game().actionsHelper.doActions(this.diceCheck.penalty);

      if (this.canRetry()) {
        // If retries are available, set pending retry and wait for player decision
        this.setPendingRetry(true);
        return { rollResult, canRetry: true };
      }

      return { nextNodeId: this.diceCheck.fail, rollResult, canRetry: false };
    }


  }


  evaluate(): EvaluatedDiceData {
    return {
      lastResult: this.getLastRollResult(),
      isAlreadyWon: this.getDiceAlreadyWon(),
      bonuses: this.getBonuses(),
      retries: {
        retriesDone: this.getRetriesDone(),
        pendingRetry: this.isThisDicePendingRetry(),
      },
    }
  }


  show(diceData: EvaluatedDiceData): RenderedDiceCheck {
    return {
      dice: this.diceCheck.dice,
      target: this.diceCheck.target,
      lastResult: diceData.lastResult,
      isAlreadyWon: diceData.isAlreadyWon,
      bonuses: diceData.bonuses,
      bonus: getTotalBonus(diceData.bonuses),
      retries: {
        maxRetries: this.diceCheck.retries ?? MAX_RETRIES,
        retriesDone: diceData.retries.retriesDone,
        retryCost: RETRY_COST,
        pendingRetry: diceData.retries.pendingRetry,
      },
    };
  }



  private canRetry() {
    const maxRetries = this.diceCheck.retries ?? MAX_RETRIES;
    return this.getRetriesDone() < maxRetries;
  }


  private getBonuses(): EvaluatedDiceBonus[] {
    return this.diceCheck.bonuses
      ?.map((b) => this.evaluateOneDiceBonus(b))
      .filter(i => i !== undefined) ?? [];
  }


  private evaluateOneDiceBonus(bonus: DiceBonus): EvaluatedDiceBonus | undefined {
    if (bonus.type === 'characterAttribute') {
      const amount = this.game().helpers.getAttribute(bonus.attribute) || 0;
      return { ...bonus, amount };
    }
    if (bonus.type === 'condition') {
      if (this.game().helpers.evaluate(bonus.condition))
        return { amount: bonus.amount, text: bonus.text };
    }
  }


  isThisDicePendingRetry = () => this.engineState().pendingRetry === this.decision.decisionId;
  setPendingRetry = (isPending: boolean) => this.engineState().pendingRetry = isPending ? this.decision.decisionId : undefined;

  getRetriesDone = () => this.engineState()[`diceRetriesDone_${this.diceId}`] ?? 0;
  incrementRetriesDone = () => this.engineState()[`diceRetriesDone_${this.diceId}`] = this.getRetriesDone() + 1;

  getDiceAlreadyWon = () => this.engineState()[`diceAlreadyWon_${this.diceId}`];
  setDiceAlreadyWon = () => this.engineState()[`diceAlreadyWon_${this.diceId}`] = true;

  getLastRollResult = () => this.engineState()[`diceLastResult_${this.diceId}`];
  setLastRollResult = (result: RollResult) => this.engineState()[`diceLastResult_${this.diceId}`] = result;


  game = () => this.decision.node.game;
  engineState = (): EngineState => this.game().state.engine

}


function rollNDices(numDice: number, diceSides: number) {
  const rolls: number[] = [];
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    const rand = Math.floor(Math.random() * diceSides) + 1
    rolls.push(rand);
    total += rand;
  }
  return { rolls, total };
}


function getTotalBonus(bonuses: EvaluatedDiceBonus[]) {
  return bonuses.reduce((sum, b) => sum + b!.amount, 0);
}

