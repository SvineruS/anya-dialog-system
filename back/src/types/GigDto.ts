type Attribute = "strength" | "dexterity" | "intelligence" | "charisma" | "reputation";

interface State {
  character: { [key in Attribute]: number } & {credits: number};  // character attributes, money, etc
  inventory: { [itemId: string]: number };  // itemId to quantity mapping
  globalState: { [key: string]: number };  // persistent state across gigs, e.g. flags for story progression
  gigState: { [key: string]: number };  // state specific to the current gig, reset when gig ends
}

// Node presenting dialogue and leading to the next node
interface GigNode {
  text?: {
    from: string;
    text: string | string[];  // can be multiple lines, support markdown
  }[];

  // Only one of the following should be present:
  decision?: DecisionOption[];  // if present, presents choices to the player
}

// A Decision Option in a GigNode, can involve a dice check
interface DecisionOption {
  text: string;
  cost?: Payable;
  dice?: DiceCheck; // if present, makes a dice roll check. On success goes to success node, on fail to fail node
}


// Cost to make a decision, either credits or an item
interface Payable {
  type: "credits" | "item";
  itemId?: string;        // e.g. itemId to consume
  amount: number;        // e.g. 10 credits
}




// A dice roll check with possible bonuses, retries, and outcomes
interface DiceCheck {
  dice: [number, number]; // e.g. [1, 20] stands for "1d20"
  // 1-6 for 1d6, 2-12 for 2d6, 1-20 for 1d20
  target: number;

  bonuses?: DiceBonus[];
  bonus: number;  // evaluated total bonus from all sources

  retries?: number;
}


// Bonuses that can modify the dice roll (add or subtract from the roll)
type DiceBonus = DiceBonus_FromCharAttribute | DiceBonus_ConditionalBonus;


// Bonus based on a character attribute
interface DiceBonus_FromCharAttribute {
  type: "characterAttribute";
  attribute: Attribute;
  amount: number;
}

// Bonus based on a condition in the game state
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



