import { GigState, Status } from "../state";
import { GigMetadata } from "../gig";
import { EvaluatedDiceBonus, RollResult } from "../evaluated";


interface MissionToSelect extends GigMetadata {
  status: Status;
}

interface GameResult {
  history: RenderedHistoryNode[];
  node: RenderedNode;
  state: GigState;
}

interface RenderedNode {
  nodeId: NodeId;
  text?: NodeText[];
  decision?: RenderedDecisionOption[];
}

interface RenderedHistoryNode extends RenderedNode {
  decisionIndex?: number; // index of the decision made at this node
}


interface NodeText {
  from: string;
  text: string | string[];  // can be multiple lines, support markdown
}

interface RenderedDecisionOption {
  decisionId: number;
  text: string;
  cost?: Payable;
  dice?: RenderedDiceCheck;
}


interface Payable {
  type: "credits" | "item";
  itemId?: string;
  amount: number;
}


interface RenderedDiceCheck {
  dice: [number, number];
  target: number;

  lastResult?: RollResult
  isAlreadyWon: boolean;

  bonuses: EvaluatedDiceBonus[];
  bonus: number;

  retries: {
    maxRetries: number;
    retriesDone: number;
    retryCost: number;
    pendingRetry: boolean;
  };

}


export {
  MissionToSelect,
  GameResult,
  RenderedNode,
  RenderedHistoryNode,
  NodeText,
  RenderedDecisionOption,
  Payable,
  RenderedDiceCheck,
  EvaluatedDiceBonus,
}



