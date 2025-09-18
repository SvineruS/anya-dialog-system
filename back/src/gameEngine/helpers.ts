import { safeEval } from "../utils/safeEval";
import { Action, Action_ModifyState, Attribute, NodeId, Payable } from "../types/gigStory";
import { GigGame } from "./gigGame";
import { GigState } from "../types/state";
import { getGigById } from "../gameData/gigs";
import { EvaluatedHistory, NodeText } from "../types/front/gigFrontTypes";


export class GigHelpers {
  private game: GigGame;

  constructor(game: GigGame) {
    this.game = game;

  }

  getStateCopy(): Readonly<GigState> {
    return JSON.parse(JSON.stringify(this.game.state));
  }


  getAttribute = (attr: Attribute) => this.getStateCopy().character[attr] || 0;

  evaluate(statement: string, additionalState = {}): any {
    const state = { ...this.getStateCopy(), ...additionalState };

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
    const [stateType, key] = action.var.split('.', 2) as [keyof GigState, string];
    if (stateType !== 'globalState' && stateType !== 'gigState')
      throw new Error(`State ${stateType} not found/allowed`);

    const state = this.game.state[stateType];

    if (action.set !== undefined) {
      state[key] = action.set;
    } else if (action.add !== undefined) {
      state[key] += action.add;
    } else {
      throw new Error(`Action must have either set or add defined.`);
    }
  }

  payCost({ type, itemId, amount }: Payable) {
    if (type === 'item') {
      const inventoryState = this.game.state.inventory;
      if (inventoryState[itemId!] < amount)
        throw new Error(`Insufficient items`);

      inventoryState[itemId!] -= amount;
      return
    }

    if (type === 'credits') {
      const characterState = this.game.state.character;
      if (characterState.credits < amount)
        throw new Error(`Insufficient credits`);

      characterState.credits -= amount;
      return
    }

    throw new Error(`Unknown cost type: ${type}`);
  }


  showHistory(): EvaluatedHistory {
    const history = this.game.state.gigHistory.slice(0, -1)
    const allNodeIds = new Set(history)
    const nodes: { [id: NodeId]: NodeText[] } = {};
    Object.entries(getGigById(this.game.gigId).story)
      .forEach(([nodeId, nodeData]) => {
        if (allNodeIds.has(nodeId) && nodeData.text)
          nodes[nodeId] = nodeData.text;
      })
    return { history, nodes }

  }
}
