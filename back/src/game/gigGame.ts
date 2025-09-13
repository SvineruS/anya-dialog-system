import {
  Action,
  Action_ModifyState,
  DecisionOption,
  DiceCheck,
  GigGraph,
  GigNode,
  NodeId,
  Payable,
  State
} from '../types/GigDefault';
import { safeEval } from "../utils/safeEval";
import { Evaluator } from './dto';
import { StateManager } from "./state";

export class GigGame {
  private graph: GigGraph;
  private state: StateManager;
  private currentNodeId: NodeId;


  constructor(graph: GigGraph, initialState: State) {
    this.graph = graph;
    this.state = new StateManager(initialState);
    this.currentNodeId = Object.keys(graph)[0]; // Start at the first node
    this.setNextNode(this.currentNodeId);
  }


  public getGame() {
    const node = this.graph[this.currentNodeId]
    const evaluatedNode = new Evaluator(this.state).evaluateNode(node);
    const state = this.getStateCopy();
    return { state, node, evaluatedNode, nodeId: this.currentNodeId };
  }

  public decide(nodeId: NodeId, decisionIndex?: number): void {
    if (nodeId !== this.currentNodeId)
      throw new Error(`nodeId mismatch. Current node is "${this.currentNodeId}"`);

    const currentNode = this.graph[this.currentNodeId];

    if (currentNode.decision) {
      if (decisionIndex === undefined || decisionIndex < 0 || decisionIndex >= currentNode.decision.length)
        throw new Error(`Decision index must be provided and valid for nodes with decisions.`);
      const decision = currentNode.decision[decisionIndex];
      if (!decision)
        throw new Error(`Invalid decision index: ${decisionIndex}`);

      return this.makeDecisionAndAdvance(decision);
    }

    this.advanceToNextNode(currentNode);

  }



  private makeDecisionAndAdvance(decision: DecisionOption) {
    if (decision.cost) {
      // Handle costs if applicable
      this.payCost(decision.cost);
    }

    if (decision.dice)
      return this.rollDice(decision.dice);
    else if (decision.next)
      return this.setNextNode(decision.next);
    else
      throw new Error('Decision must have either a dice roll or a next node.');
  }

  private advanceToNextNode(currentNode: GigNode): void {
    if (currentNode.branch) {
      const result = this.evaluate(currentNode.branch.switch);
      const next = currentNode.branch[result] || currentNode.branch.default;
      return this.setNextNode(next);
    } else if (currentNode.next)
      return this.setNextNode(currentNode.next);
    else
      throw new Error('Current node has no decisions, branches, or next node to proceed to.');
  }

  private setNextNode(nodeId: NodeId): void {
    const currentNode = this.graph[nodeId];
    if (!currentNode)
      throw new Error(`NodeId "${nodeId}" does not exist in the graph.`);

    this.currentNodeId = nodeId;


    if (currentNode.actions) {
      // Handle actions if applicable
      this.doActions(currentNode.actions)
    }


    if (!currentNode.text && !currentNode.decision) {
      // Auto-advance to a next node if currant node has no text or decisions
      this.advanceToNextNode(currentNode);
    }
  }


  private rollDice(dice: DiceCheck) {
    let totalRoll = 0;
    const [numDice, diceSides] = dice.dice;
    for (let i = 0; i < numDice; i++)
      totalRoll += Math.floor(Math.random() * diceSides) + 1;

    this.state.setVar("gigState", "rollValue",  totalRoll);

    const evaluatedBonus = new Evaluator(this.state).evaluateDiceCheck(dice).bonus;
    const isSuccess = (totalRoll + evaluatedBonus) >= dice.target;

    if (isSuccess) {
      this.setNextNode(dice.success);
    } else {
      if (dice.penalty)
        this.doActions(dice.penalty);

      this.setNextNode(dice.success);
    }
  }

  private payCost({ type, itemId, amount }: Payable) {
    if (type === 'item') {
      if (this.state.getVar("inventory", itemId!) < amount)
        throw new Error(`Insufficient items to make this decision.`);
      this.state.addVar("inventory", itemId!, -amount);
      return
    }
    if (type === 'credits') {
      if (this.state.getVar("character", "credits") < amount)
        throw new Error(`Insufficient credits to make this decision.`);
      this.state.addVar("character", "credits", -amount);
      return
    }
    throw new Error(`Unknown cost type: ${type}`);
  }


  private getStateCopy(): State {
    return JSON.parse(JSON.stringify(this.state));
  }

  private evaluate(statement: string): any {
    const stateDeepCopy = this.getStateCopy();
    const { result, readLog, error } = safeEval(statement, stateDeepCopy);
    if (error) {
      console.warn(`Error evaluating "${statement}": ${error}`, { readLog, stateDeepCopy });
    }
    return result;
  }


  private doActions(actions: Action[]) {
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
      this.state.setVar(stateType, key, action.set);
    } else if (action.add !== undefined) {
      this.state.addVar(stateType, key, action.add)
    } else {
      throw new Error(`Action must have either set or add defined.`);
    }
  }





}
