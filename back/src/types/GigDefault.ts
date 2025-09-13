type Evaluable = string;  // can be evaluated in JS context with game state, should return something
type Attribute = "strength" | "dexterity" | "intelligence" | "charisma" | "reputation";

interface State {
  character: { [key in Attribute]: number } & {credits: number};  // character attributes, money, etc
  inventory: { [itemId: string]: number };  // itemId to quantity mapping
  globalState: { [key: string]: number };  // persistent state across gigs, e.g. flags for story progression
  gigState: { [key: string]: number };  // state specific to the current gig, reset when gig ends
}


// GigGraph is a collection of GigNodes identified by NodeId, forming a dialogue tree
type GigGraph = { [id: NodeId]: GigNode };
type NodeId = string;

// Node presenting dialogue and leading to the next node
interface GigNode {
  actions?: Action[];
  text?: {
    from: string;
    text: string | string[];  // can be multiple lines, support markdown
  }[];

  // Only one of the following should be present:
  decision?: DecisionOption[];  // if present, presents choices to the player
  branch?: Branch;  // if present, branches based on a condition
  next?: NodeId;  // if present, automatically goes to the next node
}


// Node that branches based on a condition
interface Branch {
  switch: Evaluable; // e.g. "globalState.drinksCount"
  [key: string]: NodeId; // e.g. "3": "end_drunk"; "default": "end_sober"
  default: NodeId;
}

// A Decision Option in a GigNode, can involve a dice check
interface DecisionOption {
  text: string;
  cost?: Payable;
  // Only one of the following should be present:
  dice?: DiceCheck; // if present, makes a dice roll check. On success goes to success node, on fail to fail node
  next?: NodeId; // if present, automatically goes to the next node
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
  retries?: number;

  // Penalty actions fired each time the player fails a roll.
  // To only apply an action once, put it to the fail GigNode actions.
  penalty?: Action[];

  success: NodeId;
  fail: NodeId;
}


// Bonuses that can modify the dice roll (add or subtract from the roll)
type DiceBonus = DiceBonus_FromCharAttribute | DiceBonus_ConditionalBonus;


// Bonus based on a character attribute
interface DiceBonus_FromCharAttribute {
  type: "characterAttribute";
  attribute: Attribute;
}

// Bonus based on a condition in the game state
interface DiceBonus_ConditionalBonus {
  type: "condition";
  condition: Evaluable; // e.g. "globalState.knowAboutSomething > 0".
  amount: number;
  text: string;
}


// Effects that can happen after a dice roll or at the end of a gig
type Action = Action_ModifyState;

interface Action_ModifyState {
  type: "setVar";
  var: string;
  add?: number;
  set?: number;
}

export {
  Evaluable,
  Attribute,
  State,
  GigGraph,
  NodeId,
  GigNode,
  Branch,
  DecisionOption,
  Payable,
  DiceCheck,
  DiceBonus,
  DiceBonus_FromCharAttribute,
  DiceBonus_ConditionalBonus,
  Action,
  Action_ModifyState
}



