import gig1 from "./gig1";
import { GigStoryWithMetadata } from "../../types/gig";


const gigsArray: GigStoryWithMetadata[] = [gig1];
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
