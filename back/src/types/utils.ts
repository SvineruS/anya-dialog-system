export interface DecisionReturnType {
  nextNodeId?: string,
  rollResult?: { rolls: number[], isSuccess: boolean },
  canRetry?: boolean,

}
