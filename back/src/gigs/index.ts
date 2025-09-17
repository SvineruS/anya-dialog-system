import {gig as gig1} from "./gig1";


const GIGS = {
  gig1,
}

export const getGigById = (gigId: string) => {
  const gig = GIGS[gigId as keyof typeof GIGS];
  if (gig)
    return gig;

  throw new Error(`Gig with id ${gigId} not found`);
}
