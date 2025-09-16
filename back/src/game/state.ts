import { State } from "../types/GigDefault";


export class StateManager {

  private state: State;

  constructor(initialState: State) {
    this.state = initialState;
  }

  getState(): State {
    return JSON.parse(JSON.stringify(this.state));
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
