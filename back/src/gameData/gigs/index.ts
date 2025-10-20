import { GigStoryWithMetadata } from "../../types/gig";

import testGig from "./testGig";
import testGig2 from "./testGig2";
import gig1 from "./gig1_theCityBreathes";
import { validateGig } from "../../utils/validation";


const gigsArray: GigStoryWithMetadata[] = [
  gig1,
  testGig,
  testGig2,
];
const gigsById: Record<string, GigStoryWithMetadata> = {};

gigsArray.forEach(gig => {
  // validateGig(gig);  // don't work in browser demo
  gigsById[gig.metadata.id] = gig;
})

export const getGigById = (gigId: string) => {
  const gig = gigsById[gigId];
  if (gig)
    return gig;

  throw new Error(`Gig with id ${gigId} not found`);
}

export const getAllGigs = () => {
  return gigsArray;
}
