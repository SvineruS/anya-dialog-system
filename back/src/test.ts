import { validateTypeScript } from "./utils/validation/validateTypes";
import gig from "./gameData/gigs/testGig2";
import { validateGigGraph } from "./utils/validation/validateRuntime";
import { safeEval } from "./utils/safeEval";




const state = { gigState: { someVar: 1, anotherVar: 4 } };
console.log(safeEval(`gigState.someVar = 2`, state));
console.log(state)
console.log(safeEval(`gigState.someVar > 1`, state));
console.log(safeEval(`Math.max(gigState.someVar, gigState.anotherVar)`, state));
console.log(safeEval(`gigState = null`, state));
console.log(state)
console.log(safeEval(`gigState.jopa > 0`, state));
