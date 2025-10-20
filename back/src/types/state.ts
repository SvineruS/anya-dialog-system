
interface GigState {
  character: CharacterState;  // character attributes, money, etc
  inventory: InventoryState  // itemId to quantity mapping
  globalState: RandomState;  // persistent state across gigs, e.g. flags for story progression

  engine: EngineState;  // temp engine-specific state, e.g. current node, retries, etc
  gigState: RandomState;  // temp gig-specific state, e.g. drinksCount in a bar gig
  gigHistory: HistoryState[]  // history of visited nodes in the current gig
}

type UserStatePart = Pick<GigState, "character" | "inventory" | "globalState">
type MissionStatePart = Pick<GigState, "engine" | "gigState" | "gigHistory">



interface CharacterState {
  strength: number;
  charisma: number;
  intelligence: number;
  marksmanship: number;
  stealth: number;

  tier: number;  // "levels" of the game, with increasing difficulty, risk, and reward.
  streetCred: number; // A reputation system that unlocks new missions and locations.
  credits: number;
}

type NodeId = string;
type Status = 'in-progress' | 'completed' | 'failed';

interface EngineState {
  status: Status;
  currentNodeId: NodeId; // current node in the gig graph
  pendingRetry?: number; // if set, indicates a pending retry for a dice roll (stores the decisionId)

  [key: `diceLastResult_${string}`]: { rolls: number[]; isSuccess: boolean }

  [key: `diceAlreadyWon_${string}`]: boolean

  [key: `diceRetriesDone_${string}`]: number
}

interface InventoryState {
  [itemId: string]: number;  // itemId to quantity mapping
}

interface RandomState {
  [key: string]: any  // for any random-related state, e.g. "knowAboutSomething": true
}

export interface HistoryState {
  nodeId: NodeId;
  decisionIndex?: number;
  dice?: {
    rolls: number[];
    isSuccess: boolean;
  }
}




export {
  Status,
  CharacterState,
  InventoryState,
  EngineState,
  GigState,
  RandomState,
  UserStatePart,
  MissionStatePart,
}
