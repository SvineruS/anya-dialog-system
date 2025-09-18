import { GigStoryWithMetadata } from "../../types/gig";

import gig1 from "./gig1";
import gig2 from "./gig2";


const gigsArray: GigStoryWithMetadata[] = [
  gig1, gig2
];
const gigsById: Record<string, GigStoryWithMetadata> = {};

gigsArray.forEach(gig => {
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
