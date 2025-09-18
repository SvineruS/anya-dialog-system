import { GigStoryWithMetadata } from "../../types/gig";

const gig: GigStoryWithMetadata = {
  "metadata": {
    "id": "gig_griffin_01",
    "name": "Wrong Car, Wrong Time",
    "description": "Help Janks move the explosives from the wrong car to the correct one before the Griffin Gang finds out and kills him.",
    "image": "https://example.com/wrong_car_wrong_time.png",
    "location": "skylineLoopGarage",
    "client": "Janks",
    "affiliation": "Griffin Gang",
    "tier": 1,
    "startCost": 5,
    "rewards": {
      "credits": 20,
      "reputation": 5,
      "xp": 0
    }
  },
  "story": {
    "start": {
      "text": [
        {
          "from": "twin",
          "text": "Janks messed up. Real bad. He was supposed to plant the package in a Corporate runner's stealth car. Instead, he wired up some old debt collector’s rust bucket — and the guy’s gonna be here in 20 minutes. If the Griffs find out, they’ll paint the pavement with his teeth. We’ve got one shot to fix this. Ready to help?"
        }
      ],
      "decision": [
        { "text": "Yes", "next": "layout" }
      ]
    },
    "layout": {
      "text": [
        { "from": "twin", "text": "Alright, here’s the layout:" },
        {
          "from": "twin",
          "text": "The wrong car is still in the garage, front row near the busted elevator. The real target just pulled into bay 12, guarded by a local patrol drone. Janks is hiding in a storage closet, having a panic attack."
        }
      ],
      "decision": [
        {
          "text": "Brute Force — run in, rip open the trunk and yank the charge. (Strength Check)",
          "dice": {
            "dice": [1, 6],
            "target": 6,
            "bonuses": [
              { "type": "characterAttribute", "attribute": "strength" }
            ],
            "success": "trunk_open_success",
            "fail": "trunk_open_fail"
          }
        },
        {
          "text": "Talk Our Way Through — pretend to be maintenance and convince the drone to power down. (Charisma Check)",
          "dice": {
            "dice": [1, 6],
            "target": 7,
            "bonuses": [
              { "type": "characterAttribute", "attribute": "charisma" }
            ],
            "success": "drone_bluff_success",
            "fail": "drone_bluff_fail"
          }
        },
        {
          "text": "Disable from Distance — sneak the catwalks, hack the drone and swap quietly. (Intelligence + Stealth Check)",
          "dice": {
            "dice": [1, 6],
            "target": 8,
            "bonuses": [
              { "type": "characterAttribute", "attribute": "intelligence" },
              {
                "type": "condition",
                "condition": "player.hasStealthGear == 1",
                "amount": 1,
                "text": "Using stealth rig"
              }
            ],
            "success": "drone_hack_success",
            "fail": "drone_hack_fail"
          }
        }
      ]
    },

    "trunk_open_success": {
      "text": [
        {
          "from": "twin",
          "text": "Trunk popped like a soda can. Charge’s still warm. Janks, you dumbass, you almost blew this poor sucker."
        }
      ],
      "next": "approach_target"
    },

    "trunk_open_fail": {
      "text": [
        { "from": "twin", "text": "No good. I hear boots. Shit. The Griffs are here. Sorry Janks." },
        { "from": "system", "text": "(As you escape you hear gunshots and the Wilhelm scream)" },
        { "from": "twin", "text": "Mission blown. We need to ghost before they catch us." }
      ],
      "actions": [
        { "type": "setVar", "var": "gigState.failed_by_griffs", "set": 1 }
      ],
      "next": "end_failure"
    },

    "drone_bluff_success": {
      "text": [
        { "from": "twin", "text": "Maintenance voice accepted. Drone powers down for 45 seconds. No alarms." },
        { "from": "janks", "text": "Do it quick, I can't hold this together much longer." }
      ],
      "next": "approach_target"
    },

    "drone_bluff_fail": {
      "text": [
        { "from": "twin", "text": "The drone chirps an alert — somebody didn't buy it." },
        { "from": "system", "text": "Guards are alerted." }
      ],
      "actions": [
        { "type": "setVar", "var": "gigState.alerted_by_drone", "set": 1 }
      ],
      "next": "approach_target"
    },


    "drone_hack_success": {
      "text": [
        { "from": "twin", "text": "Hack complete. Drone disabled silently. You lower down and begin the swap." }
      ],
      "next": "approach_target"
    },

    "drone_hack_fail": {
      "text": [
        { "from": "twin", "text": "The hack hiccuped and the drone flickers — someone noticed." }
      ],
      "actions": [
        { "type": "setVar", "var": "gigState.alerted_by_drone", "set": 1 }
      ],
      "next": "approach_target"
    },

    "approach_target": {
      "text": [
        {
          "from": "twin",
          "text": "Okay, heading to the real target. It's locked tight. I don’t know if I can force this one open…"
        }
      ],
      "decision": [
        {
          "text": "Brute Force — Try to force the trunk open anyway.",
          "dice": {
            "dice": [1, 6],
            "target": 6,
            "bonuses": [
              { "type": "characterAttribute", "attribute": "strength" }
            ],
            "success": "swap_success",
            "fail": "force_target_fail"
          }
        },
        {
          "text": "Spoof the trunk's smart lock with a maintenance recall signal. (Intelligence Check)",
          "dice": {
            "dice": [1, 6],
            "target": 7,
            "bonuses": [
              { "type": "characterAttribute", "attribute": "intelligence" }
            ],
            "success": "spoof_success",
            "fail": "spoof_fail"
          }
        },
        {
          "text": "Distract the drone patrol and have Janks pop it. (Charisma Check)",
          "dice": {
            "dice": [1, 6],
            "target": 6,
            "bonuses": [
              { "type": "characterAttribute", "attribute": "charisma" }
            ],
            "success": "distract_success",
            "fail": "distract_fail"
          }
        }
      ]
    },


    "force_target_fail": {
      "text": [
        { "from": "twin", "text": "No good. I hear boots. Shit. The Griffs are here. Sorry Janks." },
        { "from": "system", "text": "(As you escape you hear gunshots and the Wilhelm scream)" },
        { "from": "twin", "text": "Mission blown. We need to ghost before they catch us." }
      ],
      "next": "end_failure"
    },


    "spoof_success": {
      "text": [
        { "from": "twin", "text": "Boom — signal spoofed. Trunk just opened like I booked a valet. No alarms." },
        {
          "from": "janks",
          "text": "Thanks comp, thought I was gonna bite it. I’m definitely calling you if I screw something up again…"
        },
        { "from": "twin", "text": "Payload swapped successfully. Mission complete." }
      ],
      "next": "end_success"
    },

    "spoof_fail": {
      "text": [
        { "from": "twin", "text": "The spoof didn't stick — the trunk holds and an alarm tone warms up." },
        { "from": "system", "text": "Guards are converging." }
      ],
      "actions": [
        { "type": "setVar", "var": "gigState.alerted_by_spoof", "set": 1 }
      ],
      "next": "approach_target"
    },


    "distract_success": {
      "text": [
        {
          "from": "twin",
          "text": "The patrol gets curious and swings away. Janks pops the trunk and hands over the charge — quick hands, no flags."
        },
        { "from": "twin", "text": "Payload swapped successfully. Mission complete." }
      ],
      "next": "end_success"
    },

    "distract_fail": {
      "text": [
        { "from": "twin", "text": "The distraction backfires — extra eyes show up, and someone shouts." }
      ],
      "actions": [
        { "type": "setVar", "var": "gigState.alerted_by_distraction", "set": 1 }
      ],
      "next": "approach_target"
    },

    "swap_success": {
      "text": [
        {
          "from": "twin",
          "text": "Janks: Thanks comp, thought I was gonna bite it. I’m definitely calling you if I screw something up again…"
        },
        { "from": "twin", "text": "Payload swapped successfully. Mission complete." }
      ],
      "next": "end_success"
    },

    "end_success": {
      "actions": [
        { "type": "setVar", "var": "character.credits", "add": 20 },
        { "type": "setVar", "var": "character.strength", "add": 1 },
        { "type": "setVar", "var": "character.intelligence", "add": 3 },
        { "type": "setVar", "var": "character.streetCred", "add": 5 },
      ],
      "text": [
        { "from": "system", "text": "REWARDS: 20 $AIA | +1 Strength XP | +3 Intelligence XP | +5 Street Cred" },
        { "from": "twin", "text": "Nice work. Janks owes you one." }
      ],
      "next": "end"
    },

    "end_failure": {
      "text": [
        { "from": "system", "text": "MISSION FAILED" },
        { "from": "twin", "text": "We need to disappear." }
      ],
      "actions": [
        { "type": "setVar", "var": "character.strength", "add": 1 },
        { "type": "setVar", "var": "character.credits", "add": 0 },
        { "type": "setVar", "var": "character.streetCred", "add": -3 },
      ],
      "next": "end"
    }
  }
}

export default gig;
