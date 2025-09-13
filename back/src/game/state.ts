import { State } from "../types/GigDefault";
import { safeEval } from "../utils/safeEval";


export class StateManager {

  private state: State;

  constructor(initialState: State) {
    this.state = initialState;
  }

  getState(): State {
    return JSON.parse(JSON.stringify(this.state));
  }

  evaluate(statement: string): any {
    const stateDeepCopy = this.getState();
    const { result, readLog, error } = safeEval(statement, stateDeepCopy);
    if (error) {
      console.warn(`Error evaluating "${statement}": ${error}`, { readLog, stateDeepCopy });
    }
    return result;
  }

  getVar<T extends keyof State>(stateType: T, key: keyof State[T]) {
    return this.state[stateType][key];
  }

  setVar<T extends keyof State>(stateType: T, key: keyof State[T], value: any) {
    this.state[stateType][key] = value;
  }
  addVar<T extends keyof State>(stateType: T, key: keyof State[T], value: any) {
    this.state[stateType][key] = (this.state[stateType][key] as unknown as number || 0) + value;
  }



}
