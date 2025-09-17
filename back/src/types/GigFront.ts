import {NodeId} from "./GigDefault";

type Attribute = "strength" | "charisma" | "intelligence" | "marksmanship" | "stealth";

interface State {
  character: { [key in Attribute]: number } & { credits: number };
  inventory: { [itemId: string]: number };
  globalState: { [key: string]: number };
  gigState: { [key: string]: number };
}

interface GigNode {
  nodeId: NodeId;

  text?: {
    from: string;
    text: string | string[];  // can be multiple lines, support markdown
  }[];

  decision?: (DecisionOption | undefined)[];
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

  isAlreadyWon: boolean;

  bonuses?: DiceBonus[];
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
  Attribute,
  State,
  GigNode,
  DecisionOption,
  Payable,
  DiceCheck,
  DiceBonus,
  DiceBonus_FromCharAttribute,
  DiceBonus_ConditionalBonus,
}



