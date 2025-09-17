import {GigGame} from "./gigGame";
import {safeEval} from "../utils/safeEval";
import {Action, Action_ModifyState, Attribute, Payable, State} from "../types/GigDefault";
import {StateManager} from "./gigStateManager";


export class GigStateHelper {
  state: StateManager

  constructor(state: StateManager) {
    this.state = state;
  }


  currentNodeId = () => this.state.var("game", "currentNodeId");

  diceAlreadyWin = (diceId: string) => this.state.var("game", `diceAlreadyWin_${diceId}`);
  diceRetriesDone = (diceId: string) => this.state.var("game", `diceRetriesDone_${diceId}`);
  diceLastResult = (diceId: string) => this.state.var("game", `diceLastResult_${diceId}`);
  pendingRetry = () => this.state.var("game", "pendingRetry");


  getAttribute = (attr: Attribute) => this.state.get("character", attr) || 0;



  evaluate(statement: string, additionalState = {}): any {
    const state = { ...this.state.getState(), ...additionalState };

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


}

export class GigActionsHelper {
  state: StateManager

  constructor(state: StateManager) {
    this.state = state;
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
    const [stateType, key] = action.var.split('.', 2) as [keyof State, string];
    if (stateType !== 'globalState' && stateType !== 'gigState')
      throw new Error(`State ${stateType} not found/allowed`);

    if (action.set !== undefined) {
      this.state.set(stateType, key, action.set);
    } else if (action.add !== undefined) {
      this.state.add(stateType, key, action.add)
    } else {
      throw new Error(`Action must have either set or add defined.`);
    }
  }

  payCost({ type, itemId, amount }: Payable) {
    if (type === 'item') {
      if (this.state.get("inventory", itemId!) < amount)
        throw new Error(`Insufficient items to make this decision.`);
      this.state.add("inventory", itemId!, -amount);
      return
    }
    if (type === 'credits') {
      if (this.state.get("character", "credits") < amount)
        throw new Error(`Insufficient credits to make this decision.`);
      this.state.add("character", "credits", -amount);
      return
    }
    throw new Error(`Unknown cost type: ${type}`);
  }


}
