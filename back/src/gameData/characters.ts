import { Character } from "../types/gig";

const bartender = {
  name: "Bartender",
  description: "A friendly bartender who knows all the local gossip.",
  image: "https://example.com/bartender_image.png",
  textColor: "#936e6e"
}

export const characters: Record<string, Character> = {
  bartender,
} as const;
