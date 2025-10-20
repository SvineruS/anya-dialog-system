import { GigStoryGraph } from "../../types/gigStory";
import { GigMetadata, GigStoryWithMetadata } from "../../types/gig";

const metadata: GigMetadata = {
  id: "gig1_theCityBreathes",
  name: "The City Breathes",
  description: "Deliver a Package Across Brickspire",
  image: "https://example.com/image.png",
  location: "somewhere",
  client: "Mysterious Stranger",
  affiliation: "corporation",
  tier: 1,
  startCost: 10,
  // todo what if rewards are conditional?
  rewards: {
    credits: 100,
    reputation: 10,
    xp: 50,
  }
}

const story: GigStoryGraph = {
  start: {
    text: [
      {
        from: "narrator",
        text: "As you step into the streets of Brickspire, the neon haze flickers off rain-slicked asphalt. The package in your bag is small, yet somehow heavier than it looks. Up ahead, the Griffin Gang lingers near a crossroad. They haven’t noticed you—yet. The city seems to murmur with a quiet tension, and you weigh your options. Rooftops might give you the high ground and safety in shadows (Stealth). The street could let you walk confidently past if you can talk your way through (Charisma). Or, maybe a drone could carry the package above the dangers, if you’re willing to spend extra $AIA (Intelligence)."
      },
    ],
    next: "s1_selectPath"
  },

  s1_selectPath: {
    text: [
      {
        from: "Twin",
        text: "Yo, got a package for a client in Brickspire. Needs to move fast. Streets aren’t exactly safe—someone’s always watching. You in?"
      },
      { from: "you", text: "Yeah. Let’s move." },
      {
        from: "Twin",
        text: "Paid 10 $AIA. Let’s go. Package is small, but people want it gone. " +
          "We’re at the crossroad where the Griffin Gang usually hangs. I can either: " +
          "A. Hop across rooftops and avoid them (Stealth) " +
          "B. Walk down the street and charm my way past (Charisma) " +
          "C. Send a drone to carry it for us (Costs +10 $AIA, Intelligence)"
      }
    ],
    decision: [
      {
        condition: "!gigState.s1_pathATried",
        text: "Path A – Rooftops (Stealth) \n" +
          "The rooftops rise above the neon-soaked streets, each tile slick with moisture. " +
          "Shadows stretch long, hiding you from wandering eyes—but one slip could be disastrous.",
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            { type: "characterAttribute", attribute: "stealth" },
          ],
          success: "s1_pathA_success",
          fail: "s1_pathA_fail"
        },
      },
      {
        text: "Path B – Street (Charisma) \n" +
          "Rain-slick asphalt reflects neon signs as you approach the gang. Their eyes flick toward you. Confidence is key—if you can sell it, you might pass unnoticed.",
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            { type: "characterAttribute", attribute: "charisma" },
          ],
          success: "s1_pathB_success",
          fail: "s1_pathB_fail"
        },
      },
      {
        cost: { type: "credits", amount: 10 },
        text: "Path C – Drone Delivery (Intelligence)  \n" +
          "A small drone hums quietly, ready to carry the package above the city. The air is electric, and signal interference is everywhere. One mistake and the drone could fail mid-flight.",
        dice: {
          dice: [1, 6],
          target: 3,
          bonuses: [
            { type: "characterAttribute", attribute: "intelligence" },
          ],
          success: "s1_pathC_success",
          fail: "s1_pathC_fail"
        }
      }
    ]
  },

  s1_pathA_success: {
    actions: [
      { type: "setVar", var: "gigState.s1_pathATried", set: 1 },
      { type: "setVar", var: "character.stealth", add: 2 },
    ],
    text: [
      { from: "Twin", text: "Smooth sailing. We’re above their heads—streets quiet from up here. (+2 Stealth XP)" },
    ],
    next: "s1_pathA_next"
  },

  s1_pathA_fail: {
    actions: [
      { type: "setVar", var: "gigState.s1_pathATried", set: 1 },
    ],
    text: [
      {
        from: "Twin", text: "Whoa, loose tile! Almost slid… Gonna need to decide.\n Options: " +
          "1. Try the same route again (Stealth DC 5, Warning: “Another slip and you could fall!”) " +
          "2. Drop down to street (switch to Charisma or Strength) " +
          "3. Bail (Mission fails)"
      },
    ],
    decision: [
      {
        text: "Try the same route again",
        dice: {
          dice: [1, 6],
          target: 5,
          bonuses: [
            { type: "characterAttribute", attribute: "stealth" },
          ],
          success: "s1_pathA_retry_success",
          fail: "s1_pathA_retry_fail"
        },
      },
      { text: "Drop down to street", next: "s1_selectPath" },
      { text: "Bail", next: "bail" }
    ]
  },

  s1_pathA_retry_success: {
    actions: [
      { type: "setVar", var: "character.stealth", add: 1 }
    ],
    text: [
      { from: "Twin", text: "Phew—made it this time. Luck’s still on our side. (+1 Stealth XP)" },
    ],
    next: "s1_pathA_next"
  },

  s1_pathA_retry_fail: {
    text: [
      { from: "Twin", text: "Damn—slipped again. Arm’s bleeding, grip’s shot. Not worth pushing it." },
    ],
    decision: [
      { text: "Drop down to street", next: "s1_selectPath" },
      { text: "Bail", next: "bail" }
    ]
  },

  s1_pathB_success: {
    actions: [
      { type: "setVar", var: "character.charisma", add: 2 },
    ],
    text: [
      {
        from: "Twin",
        text: "Walked right past them, smooth as silk. Nod given, nod returned. Attitude’s all it takes. (+2 Charisma XP)"
      },
    ],
    next: "s1_pathB_next"
  },
  s1_pathB_fail: {
    text: [
      { from: "Twin", text: "One steps out. “Yo, what’s in the bag?”" },
      {
        from: "Twin (Warning) ", text: "Push too hard, and they’ll smell a lie. Options: " +
          "1. Bribe (Spend 5 $AIA, automatic success, +1 Charisma XP)" +
          "2. Flee (Stealth DC 4)" +
          "3. Back out (Mission fails, −3 Street Cred)"
      },
    ],
    decision: [
      {
        text: "Bribe (Spend 5 $AIA)",
        cost: { type: "credits", amount: 5 },
        next: "s1_pathB_fail_bribe"
      },
      {
        text: "Flee",
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            { type: "characterAttribute", attribute: "stealth" },
          ],
          success: "s1_pathB_flee_success",
          fail: "s1_pathB_flee_fail"
        },
      },
      {
        text: "Back out",
        next: "bail"
      }
    ]
  },


  s1_pathB_flee_success: {
    actions: [
      { type: "setVar", var: "character.stealth", add: 1 }
    ],
    text: [
      { from: "Twin", text: "Duck left, down an alley—gone before they blinked. (+1 Stealth XP)" },
    ],
    next: "s1_pathB_next"
  },

  s1_pathB_flee_fail: {
    text: [
      { from: "Twin", text: "They spot us sprinting. Shouts echo behind." },
      {
        from: "Twin (Warning) ", text: "“They’re gaining—another slip and we’re toast.”\n" +
          "Option: Back out (Mission fails, −3 Street Cred)"
      },
    ],
    decision: [
      {
        text: "Back out",
        next: "bail"
      }
    ],
  },

  s1_pathB_fail_bribe: {
    actions: [
      { type: "setVar", var: "character.charisma", add: 1 }
    ],
    text: [
      { from: "Twin", text: "They take the cash, nod, and let us pass. Smooth move. (+1 Charisma XP)" },
    ],
    next: "s1_pathB_next"
  },

  s1_pathC_success: {
    actions: [
      { type: "setVar", var: "character.intelligence", add: 2 },
    ],
    text: [
      {
        from: "Twin",
        text: "Drone zips out, package snug under its belly. Cuts through the smog like a hot knife through butter. Tracker blinks green. (+2 Intelligence XP)\n"
      },
    ],
    next: "s1_pathC_next"
  },

  s1_pathC_fail: {
    text: [
      { from: "Twin", text: "Drone glitch! Signal’s unstable." },
      {
        from: "Twin (Warning) ", text: "“One more surge and that drone’s a bonfire.”\n Options: " +
          "1. Manually guide it (Intelligence DC 4) " +
          "2. Switch to street delivery (Charisma or Stealth DC 4)" +
          "3. Abort (Mission fails)"
      },
    ],
    decision: [
      {
        text: "Manually guide it",
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            { type: "characterAttribute", attribute: "intelligence" },
          ],
          success: "s1_pathC_retry_success",
          fail: "s1_pathC_retry_fail"
        },
      },
      { text: "Switch to street delivery", next: "s1_selectPath" },
      { text: "Abort", next: "bail" }
    ]
  },

  s1_pathC_retry_success: {
    actions: [
      { type: "setVar", var: "character.intelligence", add: 1 }
    ],
    text: [
      {
        from: "Twin",
        text: " Frequency stabilized—feed’s clean. The drone zips ahead, quadcopters whining softly. Through its lens, you catch the exchange: a hooded contact takes the package, smirks, and flashes a peace sign before vanishing into the mist. (+1 Intelligence XP)"
      },
    ],
    next: "s1_pathC_next"
  },

  s1_pathC_retry_fail: {
    text: [
      { from: "Twin", text: "Static spikes—drone smokes mid-flight. We’ll handle this ourselves." },
    ],
    decision: [
      { text: "Switch to street delivery", next: "s1_selectPath" },
      { text: "Abort", next: "bail" }
    ]
  },

  s1_pathA_next: { next: "s2_selectPath" },
  s1_pathB_next: { next: "s2_selectPath" },
  s1_pathC_next: { next: "s2_selectPath" },

  s2_selectPath: {
    text: [
      {
        from: "Twin",
        text: "A shimmer catches your eye: static crawling up a wall. Could be a sensor or scout drone. Every step matters now. Options: " +
          "A. Step carefully past it (Stealth DC 4) " +
          "B. Examine the anomaly (Intelligence DC 3) " +
          "C. Drop the package and leave (Mission fails)"
      },
    ],
    decision: [
      {
        text: "Step carefully past it",
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            { type: "characterAttribute", attribute: "stealth" },
          ],
          success: "s2_pathA_success",
          fail: "s2_pathA_fail"
        },
      },
      {
        text: "Examine the anomaly",
        dice: {
          dice: [1, 6],
          target: 3,
          bonuses: [
            { type: "characterAttribute", attribute: "intelligence" },
          ],
          success: "s2_pathB_success",
          fail: "s2_pathB_fail"
        },
      },
      {
        text: "Drop the package and leave",
        next: "bail"
      }
    ]
  },

  s2_pathA_success: {
    actions: [
      { type: "setVar", var: "character.stealth", add: 2 },
    ],
    text: [
      { from: "Twin", text: "Got through clean. Air feels heavier now, like the city’s holding its breath. (+2 Stealth XP)" },
    ],
    next: "s2_pathA_next"
  },

  s2_pathA_fail: {
    text: [
      { from: "Twin", text: "Trip hazard—almost went down hard!" },
      {
        from: "Twin (Warning) ", text: "“One more misstep and this leg’s done for.”" +
          "Options: Retry (Stealth DC 5) or abort",
      },
    ],
    decision: [
      {
        text: "Retry",
        dice: {
          dice: [1, 6],
          target: 5,
          bonuses: [
            { type: "characterAttribute", attribute: "stealth" },
          ],
          success: "s2_pathA_retry_success",
          fail: "s2_pathA_retry_fail"
        },
      },
      { text: "Abort", next: "bail" }
    ]
  },

  s2_pathA_retry_success: {
    actions: [
      { type: "setVar", var: "character.stealth", add: 1 }
    ],
    text: [
      { from: "Twin", text: "Made it through. Heartbeat louder than footsteps. (+1 Stealth XP)" },
    ],
    next: "s2_pathA_next"
  },

  s2_pathA_retry_fail: {
    actions: [
      { type: "setVar", var: "character.streetCred", add: -5 }
    ],
    text: [
      { from: "Twin", text: "That’s it—we’re spotted. Forced switch to chase or abort (Lose 5 Street Cred, +1 XP for perseverance)" },
    ],
    next: "end"
  },

  s2_pathB_success: {
    actions: [
      { type: "setVar", var: "character.intelligence", add: 2 },
    ],
    text: [
      { from: "Twin", text: "Signal’s harmless—just a reflection from a busted holosign. (+2 Intelligence XP)" },
    ],
    next: "s2_pathB_next"
  },

  s2_pathB_fail: {
    text: [
      { from: "Twin", text: "Sparks! Hidden sensor pinged." },
      {
        from: "Twin (Warning) ", text: "“Someone saw us. Move now.”\n Options: " +
          "Go back (retry earlier path), " +
          "take street route, " +
          "or abort",
      },
    ],
    decision: [
      { text: "Go back", next: "s2_selectPath" },
      { text: "Take street route", next: "s1_selectPath" },
      { text: "Abort", next: "bail" }
    ]
  },
  s2_pathA_next: { next: "s3_selectPath" },
  s2_pathB_next: { next: "s3_selectPath" },

  s3_selectPath: {
    text: [
      {
        from: "Twin",
        text: "The client’s door is ahead. Kids watch from the corner like it’s a show.\n Options: " +
          "A. Hand it over directly (Charisma DC 3) " +
          "B. Toss it onto the balcony with rope (Strength DC 3) " +
          "C. Leave it at the corner (Partial failure)"
      },
    ],
    decision: [
      {
        text: "Hand it over directly",
        dice: {
          dice: [1, 6],
          target: 3,
          bonuses: [
            { type: "characterAttribute", attribute: "charisma" },
          ],
          success: "s3_pathA_success",
          fail: "s3_pathA_fail"
        },
      },
      {
        text: "Toss it onto the balcony with rope",
        dice: {
          dice: [1, 6],
          target: 3,
          bonuses: [
            { type: "characterAttribute", attribute: "strength" },
          ],
          success: "s3_pathB_success",
          fail: "s3_pathB_fail"
        },
      },
      {
        text: "Leave it at the corner",
        next: "s3_pathC"
      }
    ]
  },

  s3_pathA_success: {
    actions: [
      { type: "setVar", var: "character.charisma", add: 2 },
    ],
    text: [
      { from: "Twin", text: "Client’s eyes tired but grateful. “You’re faster than most.” (+2 Charisma XP)" },
    ],
    next: "s3_pathA_next"
  },
  s3_pathA_fail: {
    text: [
      { from: "Twin", text: "“You’re late. Almost called someone else.”" },
      {
        from: "Twin (Warning) ", text: "“One more mistake and this deal’s off.”",
      },
    ],
    decision: [
      {
        text: "Retry handover",
        dice: {
          dice: [1, 6],
          target: 3,
          bonuses: [
            { type: "characterAttribute", attribute: "charisma" },
          ],
          success: "s3_pathA_retry_success",
          fail: "s3_pathA_retry_fail"
        },
      }
    ]
  },

  s3_pathA_retry_success: {
    actions: [
      { type: "setVar", var: "character.charisma", add: 1 }
    ],
    text: [
      { from: "Twin", text: "Talked them down. Package accepted. (+1 Charisma XP)" },
    ],
    next: "s3_pathA_next"
  },

  s3_pathA_retry_fail: {
    actions: [
      { type: "setVar", var: "character.streetCred", add: -5 }
    ],
    text: [
      { from: "Twin", text: "Door closes. Partial failure. (−5 Street Cred)" },
    ],
    next: "end"
  },


  s3_pathB_success: {
    actions: [
      { type: "setVar", var: "character.strength", add: 2 },
    ],
    text: [
      { from: "Twin", text: "Lands perfect—soft thud, no alarm. (+2 Strength XP)" },
    ],
    next: "s3_pathB_next"
  },
  s3_pathB_fail: {
    text: [
      { from: "Twin", text: "Rope slipped, package rattled." },
      {
        from: "Twin (Warning) ", text: "One more miss and we’ll crush what’s inside.",
      },
    ],
    decision: [
      {
        text: "Retry toss",
        dice: {
          dice: [1, 6],
          target: 3,
          bonuses: [
            { type: "characterAttribute", attribute: "strength" },
          ],
          success: "s3_pathB_retry_success",
          fail: "s3_pathB_retry_fail"
        },
      }
    ]
  },

  s3_pathB_retry_success: {
    actions: [
      { type: "setVar", var: "character.strength", add: 1 }
    ],
    text: [
      { from: "Twin", text: "Got it this time—that’s what I’m talking about. (+1 Strength XP)" },
    ],
    next: "s3_pathB_next"
  },

  s3_pathB_retry_fail: {
    actions: [
      { type: "setVar", var: "character.streetCred", add: -5 }
    ],
    text: [
      { from: "Twin", text: "Package dented. Client furious. Partial failure. (−5 Street Cred)" },
    ],
    next: "end"
  },

  s3_pathC: {
    actions: [
      { type: "setVar", var: "character.streetCred", add: -10 }
    ],
    text: [
      { from: "Twin", text: "Left it on the curb. Maybe they’ll find it, maybe not. (−5 Street Cred)" },
    ],
    next: "end"
  },



  s3_pathA_next: { next: "success_end" },
  s3_pathB_next: { next: "success_end" },


  success_end: {
    actions: [
      { type: "setVar", var: "character.streetCred", add: 10 }
    ],
    text: [
      { from: "Twin", text: " Package delivered. Client satisfied. The city exhales, and so do I. (+10 Street Cred, XP to all used stats)" },
    ],
    next: "end"
  },



  bail: {
    text: [
      { from: "Twin", text: "We’re pulling out. Package’s too hot." },
    ],
    next: "end"
  },





};

export default { metadata, story } as GigStoryWithMetadata;
