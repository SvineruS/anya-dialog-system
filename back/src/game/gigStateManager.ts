import { State } from "../types/GigDefault";


export class StateManager {

  private state: State;
  isDirty = false;  // if true - something was changed and should be saved


  constructor(initialState: State) {
    this.state = initialState;
  }

  getState(): State {
    return JSON.parse(JSON.stringify(this.state));
  }

  flush() {
    this.isDirty = false;
  }


  get<T extends keyof State, K extends keyof State[T]>(stateType: T, key: K): State[T][K] {
    return this.state[stateType][key];
  }

  set<T extends keyof State, K extends keyof State[T]>(stateType: T, key: K, value: State[T][K]) {
    this.state[stateType][key] = value;
    this.isDirty = true;
  }
  add<T extends keyof State, K extends keyof State[T]>(stateType: T, key: K, value: number) {
    // @ts-ignore
    this.state[stateType][key] = (this.state[stateType][key] || 0) + value;
    this.isDirty = true;
  }

  var<T extends keyof State, K extends keyof State[T]>(stateType: T, key: K) {
    return {
      get: (): State[T][K] => this.get(stateType, key),
      set: (value: State[T][K]) => this.set(stateType, key, value),
      add: (value: number) => this.add(stateType, key, value),
    }
  }



}
