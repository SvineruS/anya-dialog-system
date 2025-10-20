import { GigStoryGraph } from "./gigStory";

export interface Character {
  name: string;
  description: string;
  image: string;
  textColor: string;
}

export interface Location {
  name: string;
}

export interface GigMetadata {
  id: string;
  name: string;
  description: string;
  image: string;

  location: string; // e.g. "cyberpunk city", "space station", "fantasy kingdom"
  client: string;
  affiliation: string; // e.g. "corporation", "gang", "independent"
  tier: number;
  startCost: number;  // credits
  rewards: {
    credits: number;
    reputation: number;
    xp: number;
  }
}

export interface GigStoryWithMetadata {
  metadata: GigMetadata;
  story: GigStoryGraph;
}
