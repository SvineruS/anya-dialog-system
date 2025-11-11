import { Node } from "../../types/gigStory";
import { RenderedDecisionOption, RenderedNode } from "../../types/front/gigFrontTypes";
import { GigGame } from "../gigGame";
import { GigDecisionOption } from "./decisionOption";
import { DecisionReturnType, EvaluatedNodeData } from "../../types/evaluated";

export class GigNode {
  readonly game: GigGame;
  readonly nodeId: NodeId;
  readonly node: Node;

  constructor(gigGame: GigGame, nodeId: NodeId) {
    this.game = gigGame;
    this.nodeId = nodeId;

    this.node = this.game.story[nodeId];
    if (!this.node)
      throw new Error(`Invalid nodeId: ${nodeId}`);
  }

  makeDecision(nodeId: NodeId, decisionIndex?: number, retry?: boolean): DecisionReturnType {
    if (nodeId !== this.nodeId)
      throw new Error(`nodeId mismatch. Current node is "${this.nodeId}"`);


    // If player failed a dice roll and a retry is pending, handle that first
    const pendingRollRetry = this.game.state.engine.pendingRetry
    if (pendingRollRetry !== undefined) {
      if (decisionIndex !== pendingRollRetry)
        throw new Error(`A retry is pending for decision index ${pendingRollRetry}, must provide that index.`);
      if (retry === undefined)
        throw new Error(`A retry is pending, must provide acceptRetry parameter.`);

      return this.decisionOption(decisionIndex).diceCheck().retry(retry);
    }

    if (this.node.decision) {
      if (decisionIndex === undefined)
        throw new Error(`Decision index must be provided for nodes with decisions.`);

      return this.decisionOption(decisionIndex).makeDecision();

    }

    if (decisionIndex !== undefined)
      throw new Error(`Current node has no decisions, cannot provide a decision index.`);

    const nextNodeId = this.getNextNode();
    return { nextNodeId };
  }

  evaluate(): EvaluatedNodeData {
    const decisionsData = this.node.decision
      ? this.node.decision.map((_, idx) => this.decisionOption(idx).evaluate())
      : undefined;

    return {
      decisionsData,
    };
  }

  show(nodeData: EvaluatedNodeData): RenderedNode {
    const decisions: RenderedDecisionOption[] | undefined = nodeData.decisionsData
      ?.map((decisionData, idx) => this.decisionOption(idx).show(decisionData))
      .filter((decision) => decision != undefined);

    return {
      nodeId: this.nodeId,
      text: this.node.text,
      decision: decisions,
    };
  }


  doActions() {
    if (this.node.actions)
      this.game.helpers.doActions(this.node.actions);
  }

  canBeSkipped() {
    return !this.node.decision;
  }


  getNextNode(): NodeId {
    if (this.node.branch) {
      const branch = this.node.branch;
      const result = this.game.helpers.evaluate(branch.switch);
      return branch[result] ?? branch.default;
    } else if (this.node.next)
      return this.node.next;
    else
      throw new Error('Current node has no decisions, branches, or next node to proceed to.');
  }

  decisionOption = (decisionId: number) => new GigDecisionOption(this, decisionId);
}
