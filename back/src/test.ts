import { validateTypeScript } from "./utils/validateTypes";
import { gig } from "./gigs/gig1";
import { validateGigGraph } from "./utils/validateRuntime";
import { safeEval } from "./utils/safeEval";


validateTypeScript(`import { GigGraph } from "./types/";

export const gig: GigGraph = ` + JSON.stringify(gig));

validateGigGraph(gig);

const state = { gigState: { someVar: 1, anotherVar: 4 } };
console.log(safeEval(`gigState.someVar = 2`, state));
console.log(state)
console.log(safeEval(`gigState.someVar > 1`, state));
console.log(safeEval(`Math.max(gigState.someVar, gigState.anotherVar)`, state));
console.log(safeEval(`gigState = null`, state));
console.log(state)
console.log(safeEval(`gigState.jopa > 0`, state));
