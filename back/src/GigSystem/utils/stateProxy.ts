import { GigState } from "../types/state";
import { observableProxy } from "./observableProxy";




// logs all changes to the state, can be used for efficient saving
export class GigStateProxy {
  private state: GigState
  private log: LogEntry[];

  constructor(state: GigState) {
    this.state = state;
    this.log = [];
  }

  getStateProxy(): GigState {
    return Object.fromEntries(
      Object.keys(this.state).map(key => [key, this.getProxyOf(key as keyof GigState)])
    ) as unknown as GigState;
  }

  getLogs() {
    return this.log;
  }

  private getProxyOf<T extends keyof GigState>(stateType: T): GigState[T] {
    const handler = (key: string | number | symbol, value: any) => this.handleWrite(stateType, key.toString(), value);
    return observableProxy(this.state[stateType], handler);
  }


  private handleWrite(stateType: keyof GigState, key: string, value: any) {
    console.log(`Property ${String(key)} of ${stateType} changed to`, value);
    this.log.push({ stateType, key, value });
  }


}


export interface LogEntry {
  stateType: keyof GigState;
  key: string;
  value: any;
}
