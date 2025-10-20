import { GigStoryWithMetadata } from "../../types/gig";
import { validateTypeScript } from "./validateTypes";
import { validateGigGraph } from "./validateRuntime";


export function validateGig(gig: GigStoryWithMetadata) {

  const typesErrors = validateGigTypes(gig);
  const runtimeErrors = validateGigGraph(gig.story);

  for (const error of typesErrors)
    console.error("TypeScript Error:", error);
  for (const error of runtimeErrors)
    console.error("Runtime Error:", error);

  if (!(typesErrors.length === 0 && runtimeErrors.length === 0))
    throw new Error("Gig validation failed");

}


function validateGigTypes(gig: GigStoryWithMetadata) {
  return validateTypeScript(`
import { GigStoryGraph } from "./types/gigStory";
export const gig: GigStoryGraph = ${JSON.stringify(gig.story)}`
  );
}
