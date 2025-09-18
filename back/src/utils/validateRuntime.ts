import { safeEval } from './safeEval';
import { GigStoryGraph, Node, NodeId } from '../types/gigStory';

export function validateGigGraph(graph: GigStoryGraph): string[] {
  const errors: string[] = [];
  const allNodeIds = new Set(Object.keys(graph));
  allNodeIds.add("end")
  const referencedNodeIds = new Set<string>();
  referencedNodeIds.add(Object.keys(graph)[0]); // starting node

  // Helper to validate mutual exclusivity
  function validateMutualExclusivity(nodeId: NodeId, fields: (keyof Node)[]) {
    const presentFields = fields.filter((field) => graph[nodeId][field] !== undefined);
    if (presentFields.length > 1) {
      errors.push(`Node ${nodeId} has multiple mutually exclusive fields: ${presentFields.join(', ')}`);
    }
  }

  function validateReferencedNode(nodeId: NodeId, where: string) {
    if (!allNodeIds.has(nodeId)) {
      errors.push(`Referenced NodeId "${nodeId}" (${where}) does not exist in the graph`);
    } else {
      referencedNodeIds.add(nodeId);
    }
  }

  // Validate each node
  for (const [nodeId, node] of Object.entries(graph)) {
    // Validate mutual exclusivity
    validateMutualExclusivity(nodeId, ['next', 'decision', 'branch']);

    // Validate `next` field
    if (node.next) {
      validateReferencedNode(node.next, `"${nodeId}".next`);
    }

    // Validate `decision` field
    if (node.decision) {
      node.decision.forEach((decision, index) => {
        if (decision.next) {
          validateReferencedNode(decision.next, `"${nodeId}".decision[${index}].next`);
        }

        if (decision.dice) {
          validateReferencedNode(decision.dice.success, `"${nodeId}".decision[${index}].dice.success`);
          validateReferencedNode(decision.dice.fail, `"${nodeId}".decision[${index}].dice.fail`);
        }
      });
    }

    // Validate `branch` field
    if (node.branch) {
      validateEvaluable(node.branch.switch, `Node "${nodeId}" branch.switch`);
      Object.entries(node.branch).forEach(([key, value]) => {
        if (key !== 'switch')
          validateReferencedNode(value, `"${nodeId}".branch.${key}`);
      });
    }

    // Validate `Evaluable` fields
    if (node.actions) {
      // node.actions.forEach((action, index) => {
      //   if (action.type === 'setVar' && action.var) {
      //     validateEvaluable(action.var, `Node "${nodeId}" actions[${index}].var`);
      //   }
      // });
    }
  }

  // Check for unused NodeIds
  allNodeIds.forEach((nodeId) => {
    if (!referencedNodeIds.has(nodeId)) {
      errors.push(`Node "${nodeId}" is not referenced by any other node`);
    }
  });

  return errors;

  // Helper to validate Evaluable fields
  function validateEvaluable(evaluable: string, context: string) {
      const result = safeEval(evaluable);
      if (result.error) {
        errors.push(`Invalid Evaluable in ${context}: ${result.error}`);
      }
  }


}
