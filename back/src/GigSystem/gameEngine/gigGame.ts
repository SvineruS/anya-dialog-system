import { GigStoryGraph } from "../types/gigStory";
import { GameResult } from "../types/front/gigFrontTypes";
import { GigHelpers, } from "./helpers";
import { getGigById } from "../gameData/gigs";
import { GigNode } from "./entities/node";
import { GigState, HistoryStateItem } from "../types/state";
import { NodeId } from "../types/common";


export class GigGame {
  readonly gigId: string;

  readonly story: GigStoryGraph;
  readonly state: Readonly<GigState>;
  readonly helpers: GigHelpers;

  constructor(state: GigState, gigId: string) {
    this.gigId = gigId;
    this.state = state;
    this.story = getGigById(gigId).story;
    this.helpers = new GigHelpers(this);
  }

  static createNewGame(state: GigState, gigId: string) {
    const game = new GigGame(state, gigId);
    const gig = getGigById(gigId);

    if (gig.metadata.tier > state.character.tier)
      throw new Error(`Character tier too low for this gig. Required: ${gig.metadata.tier}, current: ${state.character.tier}`);

    game.helpers.payCost({ type: 'credits', amount: gig.metadata.startCost });

    const currentNodeId = Object.keys(gig.story)[0];
    game.activateNode(currentNodeId);

    return game;
  }



  show(): GameResult {
    const currentNode = this.node(this.state.engine.currentNodeId);
    const nodeData = currentNode.evaluate();

    return {
      history: this.helpers.showHistory(),
      state: this.helpers.getStateCopy(),
      node: currentNode.show(nodeData),
    };

  }

  makeDecision(nodeId: NodeId, decisionIndex?: number, retry?: boolean) {
    if (this.state.engine.status !== 'in-progress')
      throw new Error(`Cannot make decisions on a completed or failed gig.`);

    const currentNode = this.node(this.state.engine.currentNodeId);
    const result = currentNode.makeDecision(nodeId, decisionIndex, retry);

    const lastHistoryEntry = this.state.gigHistory[this.state.gigHistory.length - 1];
    lastHistoryEntry.decisionIndex = decisionIndex;
    if (result?.rollResult)
      lastHistoryEntry.nodeData = currentNode.evaluate(); // update node data with roll result


    if (result?.nextNodeId)
      this.activateNode(result.nextNodeId);

    return result;
  }


  private activateNode(nodeId: NodeId) {
    if (nodeId == "end") {
      this.state.engine.status = 'completed';
      return;
    }

    const node = this.node(nodeId);

    this.state.engine.currentNodeId = nodeId;
    const newHistoryEntry: HistoryStateItem = {
      nodeId,
      nodeData: node.evaluate(),
      decisionIndex: undefined
    }
    this.state.gigHistory.push(newHistoryEntry);

    node.doActions();


    if (node.canBeSkipped())
      this.activateNode(node.getNextNode());
  }

  node = (nodeId: NodeId) => new GigNode(this, nodeId)

}
