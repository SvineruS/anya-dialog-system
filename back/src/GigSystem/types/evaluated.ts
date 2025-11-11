export interface EvaluatedNodeData {
  decisionsData?: EvaluatedDecisionData[];
}

export interface EvaluatedDecisionData {
  conditionMet: boolean;
  diceData?: EvaluatedDiceData;
}

export interface EvaluatedDiceData {
  lastResult?: RollResult,
  isAlreadyWon: boolean,
  bonuses: EvaluatedDiceBonus[],
  retries: {
    retriesDone: number,
    pendingRetry: boolean,
  },
}


export interface DecisionReturnType {
  nextNodeId?: NodeId,
  rollResult?: RollResult,
  canRetry?: boolean,
}


export interface RollResult {
  rolls: number[]
  isSuccess: boolean
}


export type EvaluatedDiceBonus = DiceBonus_FromCharAttribute | DiceBonus_ConditionalBonus;


export interface DiceBonus_FromCharAttribute {
  type: "characterAttribute";
  attribute: Attribute;
  amount: number;
}

export interface DiceBonus_ConditionalBonus {
  amount: number;
  text: string;
}
