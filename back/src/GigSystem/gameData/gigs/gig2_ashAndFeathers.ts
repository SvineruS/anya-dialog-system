import { GigStoryGraph } from "../../types/gigStory";
import { GigMetadata, GigStoryWithMetadata } from "../../types/gig";

const metadata: GigMetadata = {
  id: "gig2_ashAndFeathers",
  name: "Ash and Feathers",
  description: "Infiltrate Phoenix Cache",
  image: "https://example.com/ash_and_feathers.png",
  location: "Brickspire, East Sector",
  client: "Griffins",
  affiliation: "gang",
  tier: 1,
  startCost: 12,
  rewards: {
    credits: 0,
    reputation: 20,
    xp: 20,
  }
};

const story: GigStoryGraph = {
  start: {
    text: [
      {
        from: "narrator",
        text: "The eastern sector of Brickspire twists like a maze, neon flickering off puddles. Smoke rises from forgotten vents, carrying the acrid scent of burned circuitry. Ahead lies the Phoenix Gang’s cache, hidden between corrugated walls, guarded by shadows and cameras. Each step is a negotiation with fate. You can take the vents above to stay hidden (Stealth), walk confidently in as Summitech techs (Charisma), or scope the perimeter and hack a camera to slip in unseen (Intelligence, DC 4)."
      },
    ],
    next: "s1_selectPath"
  },

  s1_selectPath: {
    text: [
      { from: "Twin", text: "Got a hot one from the Griffins. Phoenix Gang torched a safehouse. We go in like Summitech repair, plant insignia, maybe swipe or trash goods. You in?" },
      { from: "you", text: "Sounds messy. Any specifics I should know?" },
      { from: "Twin", text: "Cache’s in Brickspire east sector. Alleyways twist like a maze, cameras everywhere. Keep it clean, or Griffin’s gonna want blood." },
      { from: "system", text: "−12 $AIA (Startup Cost Paid)" },
      { from: "system", text: "Mission 'Ash and Feathers' started." },
      { from: "Twin", text: "Front door’s out. I can either: A. Slip through vents above (Stealth) B. Walk in confident as Summitech techs (Charisma) C. Scope from street, hack a camera (Intelligence, DC 4)" },
    ],
    decision: [
      {
        text: "Path A – Vent Entry (Stealth)",
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            { type: "characterAttribute", attribute: "stealth" }
          ],
          success: "s1_pathA_success",
          fail: "s1_pathA_fail"
        }
      },
      {
        text: "Path B – Confident Tech (Charisma)",
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            { type: "characterAttribute", attribute: "charisma" }
          ],
          success: "s1_pathB_success",
          fail: "s1_pathB_fail"
        }
      },
      {
        text: "Path C – Hack Camera (Intelligence)",
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            { type: "characterAttribute", attribute: "intelligence" }
          ],
          success: "s1_pathC_success",
          fail: "s1_pathC_fail"
        }
      }
    ]
  },

  s1_pathA_success: {
    actions: [
      { type: "setVar", var: "character.stealth", add: 2 }
    ],
    text: [
      { from: "Twin", text: "Shadows and metal mesh are our friends. No one notices us. Griffins would be proud. (+2 Stealth XP)" }
    ],
    next: "s2_insideCache"
  },

  s1_pathA_fail: {
    text: [
      { from: "Twin", text: "Tile’s loose! Scraped my shoulder. One more slip and it’s hospital or worse." }
    ],
    decision: [
      {
        text: "Retry (Stealth DC 5)",
        dice: {
          dice: [1, 6],
          target: 5,
          bonuses: [
            { type: "characterAttribute", attribute: "stealth" }
          ],
          success: "s1_pathA_retry_success",
          fail: "s1_pathA_retry_fail"
        }
      },
      { text: "Drop to street (Charisma/Strength)", next: "s1_selectPath" },
      { text: "Bail", next: "bail" }
    ]
  },

  s1_pathA_retry_success: {
    actions: [{ type: "setVar", var: "character.stealth", add: 1 }],
    text: [{ from: "Twin", text: "Made it past the vents. Package intact. (+1 Stealth XP)" }],
    next: "s2_insideCache"
  },

  s1_pathA_retry_fail: {
    text: [{ from: "Twin", text: "Shoulder’s bleeding. Air’s tight. Not worth pushing it." }],
    decision: [
      { text: "Drop to street", next: "s1_selectPath" },
      { text: "Bail", next: "bail" }
    ]
  },

  s1_pathB_success: {
    actions: [{ type: "setVar", var: "character.charisma", add: 2 }],
    text: [{ from: "Twin", text: "Walked in like we owned the place. Nobody batted an eye. (+2 Charisma XP)" }],
    next: "s2_insideCache"
  },

  s1_pathB_fail: {
    text: [
      { from: "Twin", text: "Clerk squints. 'Who sent you?'" },
      { from: "Twin (Warning)", text: "They’re wary. Lie wrong and it’s over. Options: Bribe (5 $AIA), Flee (Stealth DC 4), Back out" }
    ],
    decision: [
      { text: "Bribe (5 $AIA)", cost: { type: "credits", amount: 5 }, next: "s1_pathB_fail_bribe" },
      {
        text: "Flee",
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [{ type: "characterAttribute", attribute: "stealth" }],
          success: "s1_pathB_flee_success",
          fail: "s1_pathB_flee_fail"
        }
      },
      { text: "Back out", next: "bail" }
    ]
  },

  s1_pathB_fail_bribe: {
    actions: [{ type: "setVar", var: "character.charisma", add: 1 }],
    text: [{ from: "Twin", text: "Smooth. Coins change hands. They step aside. (+1 Charisma XP)" }],
    next: "s2_insideCache"
  },

  s1_pathB_flee_success: {
    actions: [{ type: "setVar", var: "character.stealth", add: 1 }],
    text: [{ from: "Twin", text: "Vanished into shadows. (+1 Stealth XP)" }],
    next: "s2_insideCache"
  },

  s1_pathB_flee_fail: {
    text: [
      { from: "Twin", text: "Spotted. Footsteps close." },
    ],
    decision: [
      { text: "Back out", next: "bail" }
    ]
  },

  s1_pathC_success: {
    actions: [{ type: "setVar", var: "character.intelligence", add: 2 }],
    text: [{ from: "Twin", text: "Camera looped. Entry clear. (+2 Intelligence XP)" }],
    next: "s2_insideCache"
  },

  s1_pathC_fail: {
    text: [
      { from: "Twin", text: "Signal jittery. Can’t mask it long." },
      { from: "Twin (Warning)", text: "Another surge and alarms light up the place. Options: Manual override (Intelligence DC 5), Switch to vent/street, Abort" }
    ],
    decision: [
      {
        text: "Manual override",
        dice: {
          dice: [1, 6],
          target: 5,
          bonuses: [{ type: "characterAttribute", attribute: "intelligence" }],
          success: "s1_pathC_override_success",
          fail: "s1_pathC_override_fail"
        }
      },
      { text: "Switch to vent/street", next: "s1_selectPath" },
      { text: "Abort", next: "bail" }
    ]
  },

  s1_pathC_override_success: {
    actions: [{ type: "setVar", var: "character.intelligence", add: 1 }],
    text: [{ from: "Twin", text: "Loop stabilizes. Path is ours. (+1 Intelligence XP)" }],
    next: "s2_insideCache"
  },

  s1_pathC_override_fail: {
    text: [{ from: "Twin", text: "Sparks fly! Cameras reset. Gotta go street or vent." }],
    decision: [
      { text: "Switch to street or vent", next: "s1_selectPath" },
      { text: "Abort", next: "bail" }
    ]
  },

  s2_insideCache: {
    text: [
      { from: "Twin", text: "Inside Phoenix Cache. Crates stamped with the Phoenix bird form a labyrinth. Shadows hide dangers. Options: Plant Griffin insignia, Steal goods, Frame Summitech." }
    ],
    decision: [
      { text: "Plant Insignia", next: "s2_plantInsignia" },
      { text: "Steal Goods", next: "s2_stealGoods" },
      { text: "Frame Summitech", next: "s2_frameSummitech" }
    ]
  },

  s2_plantInsignia: {
    text: [
      { from: "Twin", text: "Stamped the mark. Phoenixes will notice tonight. (+2 Street Cred)" }
    ],
    next: "success_end"
  },

  s2_stealGoods: {
    text: [
      { from: "Twin", text: "Crates in hand. Sell or stash later. (+1 Street Cred)" }
    ],
    next: "success_end"
  },

  s2_frameSummitech: {
    text: [
      { from: "Twin", text: "Evidence planted. Griffin laughs at the irony. (+1 Street Cred)" }
    ],
    next: "success_end"
  },

  success_end: {
    actions: [
      { type: "setVar", var: "character.streetCred", add: 20 },
      { type: "setVar", var: "character.xp", add: 20 }
    ],
    text: [
      { from: "Twin", text: "Griffin’s happy. Reputation solid. Cache disrupted. (+20 XP, +20 Street Cred)" }
    ],
    next: "end"
  },

  bail: {
    text: [
      { from: "Twin", text: "We’re pulling out. Mission aborted. (−12 $AIA, −3 Street Cred)" }
    ],
    actions: [
      { type: "setVar", var: "character.streetCred", add: -3 },
      { type: "setVar", var: "character.credits", add: -12 }
    ],
    next: "end"
  }
};

export default { metadata, story } as GigStoryWithMetadata;
