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
import { Evaluator } from './evaluator';
import { StateManager } from "./state";

export class GigGame {
  private graph: GigGraph;
  private state: StateManager;
  private currentNodeId: NodeId;


  constructor(graph: GigGraph, initialState: State) {
    this.graph = graph;
    this.state = new StateManager(initialState);
    this.currentNodeId = Object.keys(graph)[0]; // Start at the first node
    this.advanceToNextNode(this.currentNodeId);
  }


  public getGame() {
    const node = this.graph[this.currentNodeId]
    const evaluatedNode = new Evaluator(this.state).evaluateNode(node);
    const state = this.state.getState();
    return { state, node, evaluatedNode, nodeId: this.currentNodeId };
  }

  public decide(nodeId: NodeId, decisionIndex?: number): void {
    if (nodeId !== this.currentNodeId)
      throw new Error(`nodeId mismatch. Current node is "${this.currentNodeId}"`);

    let currentNode = this.graph[this.currentNodeId];

    let nextNodeId: NodeId;

    if (currentNode.decision) {
      if (decisionIndex === undefined || decisionIndex < 0 || decisionIndex >= currentNode.decision.length)
        throw new Error(`Decision index must be provided and valid for nodes with decisions.`);
      const decision = currentNode.decision[decisionIndex];
      if (!decision)
        throw new Error(`Invalid decision index: ${decisionIndex}`);

      nextNodeId = this.makeDecision(decision, decisionIndex);
    } else {
      nextNodeId = this.getNextNode(currentNode);
    }

    this.advanceToNextNode(nextNodeId);



  }

  private advanceToNextNode(nodeId: NodeId): void {
    const newCurrentNode = this.graph[nodeId];
    if (!newCurrentNode)
      throw new Error(`NodeId "${nodeId}" does not exist in the graph.`);

    this.currentNodeId = nodeId;


    if (newCurrentNode.actions) {
      // Handle actions if applicable
      this.doActions(newCurrentNode.actions)
    }


    // Auto-advance to a next node if currant node has no text or decisions
    if (!newCurrentNode.text && !newCurrentNode.decision) {
      const nextNodeId = this.getNextNode(newCurrentNode);
      this.advanceToNextNode(nextNodeId);
    }
  }




  private makeDecision(decision: DecisionOption, decisionIndex: number): NodeId {
    if (decision.condition) {
      const conditionMet = new Evaluator(this.state).evaluate(decision.condition);
      if (!conditionMet)
        throw new Error(`Decision condition not met for decision index ${decisionIndex}.`);
    }

    if (decision.cost) // Handle costs if applicable
      this.payCost(decision.cost);


    if (decision.dice)
      return this.rollDice(decision.dice, decisionIndex);
    else if (decision.next)
      return decision.next;
    else
      throw new Error('Decision must have either a dice roll or a next node.');
  }



  private getNextNode(currentNode: GigNode): NodeId {
    if (currentNode.branch)
      return new Evaluator(this.state).evaluateBranchNode(currentNode.branch);
    else if (currentNode.next)
      return currentNode.next;
    else
      throw new Error('Current node has no decisions, branches, or next node to proceed to.');
  }

  private rollDice(dice: DiceCheck, decisionIndex: number): NodeId {
    const rollId = `roll_${this.currentNodeId}_${decisionIndex}`;
    const alreadyWin = this.state.getVar("gigState", rollId);
    if (alreadyWin) {
      // If already won, skip the roll and go to success
      return dice.success;
    }


    let rollValue = 0;
    const [numDice, diceSides] = dice.dice;
    for (let i = 0; i < numDice; i++)
      rollValue += Math.floor(Math.random() * diceSides) + 1;

    const evaluatedBonus = new Evaluator(this.state).evaluateDiceCheck(dice).bonus;
    const isSuccess = (rollValue + evaluatedBonus) >= dice.target;

    this.state.setVar("gigState", "rollValue",  rollValue);
    this.state.setVar("gigState", "isRollSuccess", isSuccess);


    if (isSuccess) {
      this.state.setVar("gigState", rollId, 1);
      return dice.success;
    } else {
      if (dice.penalty)
        this.doActions(dice.penalty);

      return dice.fail;
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
