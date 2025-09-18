import { validateTypeScript } from "./utils/validateTypes";
import gig from "./gameData/gigs/gig2";
import { validateGigGraph } from "./utils/validateRuntime";
import { safeEval } from "./utils/safeEval";


validateTypeScript(`import { GigStoryGraph } from "./types/gigStory";

export const gig: GigStoryGraph = ` + JSON.stringify(gig.story));

console.log(validateGigGraph(gig.story));

const state = { gigState: { someVar: 1, anotherVar: 4 } };
console.log(safeEval(`gigState.someVar = 2`, state));
console.log(state)
console.log(safeEval(`gigState.someVar > 1`, state));
console.log(safeEval(`Math.max(gigState.someVar, gigState.anotherVar)`, state));
console.log(safeEval(`gigState = null`, state));
console.log(state)
console.log(safeEval(`gigState.jopa > 0`, state));
