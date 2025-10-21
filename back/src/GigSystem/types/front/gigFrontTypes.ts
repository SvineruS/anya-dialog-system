import {NodeId} from "../gigStory";
import { GigState, HistoryState, Status } from "../state";
import { GigMetadata } from "../gig";

type Attribute = "strength" | "charisma" | "intelligence" | "marksmanship" | "stealth";


interface MissionToSelect extends GigMetadata {
  status: Status;
}

interface GameResult {
  history: EvaluatedHistory;
  node: Node;
  state: GigState;
}

interface EvaluatedHistory {
  history: HistoryState[];
  nodes: { [id: NodeId]: Node};
}


interface Node {
  nodeId: NodeId;

  text?: NodeText[];

  decision?: DecisionOption[];
}

interface NodeText {
  from: string;
  text: string | string[];  // can be multiple lines, support markdown
}

interface DecisionOption {
  decisionId: number;
  text: string;
  cost?: Payable;
  dice?: DiceCheck;
}


interface Payable {
  type: "credits" | "item";
  itemId?: string;
  amount: number;
}


interface DiceCheck {
  dice: [number, number];
  target: number;

  lastResult?: { rolls: number[]; isSuccess: boolean }
  isAlreadyWon: boolean;

  bonuses: DiceBonus[];
  bonus: number;

  retries: {
    maxRetries: number;
    retriesDone: number;
    retryCost: number;
    pendingRetry: boolean;
  };

}


type DiceBonus = DiceBonus_FromCharAttribute | DiceBonus_ConditionalBonus;


interface DiceBonus_FromCharAttribute {
  type: "characterAttribute";
  attribute: Attribute;
  amount: number;
}

interface DiceBonus_ConditionalBonus {
  amount: number;
  text: string;
}


export {
  MissionToSelect,
  GameResult,
  EvaluatedHistory,
  Attribute,
  Node,
  NodeText,
  DecisionOption,
  Payable,
  DiceCheck,
  DiceBonus,
  DiceBonus_FromCharAttribute,
  DiceBonus_ConditionalBonus,
}



