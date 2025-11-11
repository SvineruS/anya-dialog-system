import { GigMetadata, GigStoryWithMetadata } from '../../types/gig';
import { GigStoryGraph } from '../../types/gigStory';

const metadata: GigMetadata = {
  id: 'gig3_bugInTheWires',
  name: 'Bug in the Wires',
  description:
    'Summitech’s grid is acting up. Dr. Liora Chen from Summitech’s Grid Security wants to talk about a job.',
  image: 'https://example.com/image.png',
  location: 'Fiber Tunnels, The Grid District',
  client: 'Dr. Liora Chen, Grid Security Lead',
  affiliation: 'Summitech',
  tier: 1,
  startCost: 15,
  rewards: {
    credits: 25,
    reputation: 0,
    xp: 0,
  },
};
const story: GigStoryGraph = {
  start: {
    text: [
      {
        from: 'narrator',
        text: 'The illuminated sign above the café flickers “Perk & Pixel,” its light reflecting in the puddles and rain-streaked windows. Inside, holo-menus hover above tables, advertising espresso blends that glow faintly in electric blue and violet.',
      },
      {
        from: 'narrator',
        text: 'At a corner table, a woman leans forward, elbows on the metal surface. The sleeves of her white lab coat are rolled back to reveal a lattice of fine cybernetic implants tracing her forearms. Her hair is cropped short, dark with streaks of electric teal.',
      },
      {
        from: 'narrator',
        text: 'Dr. Liora Chen looks up as you approach. “Ah, you’re the one,” she says. “Grid’s got a… situation. Someone’s injected rogue code into our network. It’s spreading fast. If it hits the central nodes, we could lose hours of operations, and the logs could end up in the wrong hands.”',
      },
      {
        from: 'narrator',
        text: 'She swipes the air—a hologram of the fiber tunnels lights up above the table, pulsing where the code has infected systems.',
      },
      {
        from: 'narrator',
        text: '“I need this neutralized,” she continues, eyes scanning the schematic like a hawk. “But no one can know we’ve hired outside help—can’t have anyone thinking we don’t have this under control. So you’ll have to stay hidden from our own security. Track whatever this is, shut it down, and report back clean. No traces, no fingerprints. Whoever’s behind it—Dragons, ghosts, hackers—I don’t care. They don’t get a chance to trace us. Understood?”',
      },
      {
        from: 'Twin',
        text: 'Clean job, high risk. You know the drill. Fiber tunnels below, bots, security, rogue code—your choice of approach. Stealth, intelligence, or a little charm. Make it count.',
      },
      {
        from: 'narrator',
        text: 'Fiber tunnels hum beneath the city, the maintenance and utility passageways that house fiber-optic cables and other infrastructure for the city’s communications and network systems. Here, walls are lined with flickering conduits and cables that pulse like veins. Sparks flare where the rogue code has broken into Summitech’s grid, and every step echoes through the narrow passageways.',
      },
      {
        from: 'narrator',
        text: 'You can sneak past security bots, hack the terminal remotely, or distract guards and walk in.',
      },
    ],
    next: 's1_selectPath',
  },
  s1_selectPath: {
    text: [
      {
        from: 'Twin',
        text: 'Entrance to fiber tunnels is narrow. Choose:',
      },
    ],
    decision: [
      {
        text: 'Sneak past security bots',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'stealth',
            },
          ],
          success: 's1_pathA_success',
          fail: 's1_pathA_fail',
        },
      },
      {
        text: 'Hack the terminal remotely',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's1_pathB_success',
          fail: 's1_pathB_fail',
        },
      },
      {
        text: 'Distract guards and walk in',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'charisma',
            },
          ],
          success: 's1_pathC_success',
          fail: 's1_pathC_fail',
        },
      },
    ],
  },
  s1_pathA_success: {
    actions: [
      {
        type: 'setVar',
        var: 'gigState.s1_pathATried',
        set: 1,
      },
      {
        type: 'setVar',
        var: 'character.stealth',
        add: 2,
      },
    ],
    text: [
      {
        from: 'narrator',
        text: 'The narrow fiber tunnel sizzles with electricity, conduits snaking along the walls like pulsing, glowing arteries. Security bots glide silently along the rails, their sensors sweeping methodically, scanning for any heat signatures or unauthorized movement. Sparks leap occasionally from exposed junctions, casting brief flickers of light across the damp, metal floor.\nYou hug the shadows, timing each step with the bots’ slow, deliberate patrols. The air smells faintly of overheated circuits. One slip—just the scrape of a boot against a conduit, or a twitch in the shadows—and the bots’ red sensors will flare, alarms echoing down the tunnel.',
      },
      {
        from: 'Twin',
        text: 'Glided right past. Bots’ sensors missed us.',
      },
    ],
    next: 's1_pathA_next',
  },
  s1_pathA_fail: {
    actions: [
      {
        type: 'setVar',
        var: 'gigState.s1_pathATried',
        set: 1,
      },
    ],
    text: [
      {
        from: 'narrator',
        text: 'The narrow fiber tunnel sizzles with electricity, conduits snaking along the walls like pulsing, glowing arteries. Security bots glide silently along the rails, their sensors sweeping methodically, scanning for any heat signatures or unauthorized movement. Sparks leap occasionally from exposed junctions, casting brief flickers of light across the damp, metal floor.\nYou hug the shadows, timing each step with the bots’ slow, deliberate patrols. The air smells faintly of overheated circuits. One slip—just the scrape of a boot against a conduit, or a twitch in the shadows—and the bots’ red sensors will flare, alarms echoing down the tunnel.',
      },
      {
        from: 'Twin',
        text: 'Another misstep and we’re going to get shocked—or worse.',
      },
    ],
    decision: [
      {
        text: 'Retry',
        dice: {
          dice: [1, 6],
          target: 5,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'stealth',
            },
          ],
          success: 's1_pathA_retry_success',
          fail: 's1_pathA_retry_fail',
        },
      },
      {
        text: 'Switch to Hack',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's1_pathB_success',
          fail: 's1_pathB_fail',
        },
      },
      {
        text: 'Bail',
        next: 'bail',
      },
    ],
  },
  s1_pathA_retry_success: {
    actions: [
      {
        type: 'setVar',
        var: 'character.stealth',
        add: 1,
      },
    ],
    text: [
      {
        from: 'Twin',
        text: 'Perfect timing. Went unnoticed.',
      },
    ],
    next: 's1_pathA_next',
  },
  s1_pathA_retry_fail: {
    text: [
      {
        from: 'Twin',
        text: 'Sparks pop. Jacket singed.',
      },
    ],
    decision: [
      {
        text: 'Switch to Hack',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's1_pathB_success',
          fail: 's1_pathB_fail',
        },
      },
      {
        text: 'Bail',
        next: 'bail',
      },
    ],
  },
  s1_pathB_success: {
    actions: [
      {
        type: 'setVar',
        var: 'character.intelligence',
        add: 2,
      },
    ],
    text: [
      {
        from: 'narrator',
        text: 'The terminal sits against the wall of the fiber tunnel, half-hidden behind a tangle of exposed conduits. Amber lights blink rhythmically on the access port, casting a faint glow over your gloves as you crouch low. The terminal buzzes with energy, the rogue subroutine writhing through its circuits. Sparks dance from exposed wiring nearby, and the low, constant vibration of the fiber-optic cables hums all around. One wrong splice or misread line of code and the alarm grid could flare across the tunnels, alerting every security bot in the sector.\nYou slide your interface cables into the port, fingertips brushing the cool metal, eyes darting across scrolling code. The rogue program resists, firing countermeasures through the lines—digital spikes and scrambled data—like it knows you’re there to catch it. Each command you enter must be precise, each loop executed cleanly, or the surge will cascade, setting off alarms and frying circuits.',
      },
      {
        from: 'Twin',
        text: 'Signal traced to rogue subroutine. No alarms.',
      },
    ],
    next: 's1_pathB_next',
  },
  s1_pathB_fail: {
    text: [
      {
        from: 'narrator',
        text: 'The terminal sits against the wall of the fiber tunnel, half-hidden behind a tangle of exposed conduits. Amber lights blink rhythmically on the access port, casting a faint glow over your gloves as you crouch low. The terminal buzzes with energy, the rogue subroutine writhing through its circuits. Sparks dance from exposed wiring nearby, and the low, constant vibration of the fiber-optic cables hums all around. One wrong splice or misread line of code and the alarm grid could flare across the tunnels, alerting every security bot in the sector.\nYou slide your interface cables into the port, fingertips brushing the cool metal, eyes darting across scrolling code. The rogue program resists, firing countermeasures through the lines—digital spikes and scrambled data—like it knows you’re there to catch it. Each command you enter must be precise, each loop executed cleanly, or the surge will cascade, setting off alarms and frying circuits.',
      },
      {
        from: 'Twin',
        text: 'Signal fights back. One more surge and we’ll fry the network.',
      },
    ],
    decision: [
      {
        text: 'Retry',
        dice: {
          dice: [1, 6],
          target: 5,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's1_pathB_retry_success',
          fail: 's1_pathB_retry_fail',
        },
      },
      {
        text: 'Enter tunnels stealthily',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'stealth',
            },
          ],
          success: 's1_pathA_success',
          fail: 's1_pathA_fail',
        },
      },
      {
        text: 'Bail',
        next: 'bail',
      },
    ],
  },
  s1_pathB_retry_success: {
    actions: [
      {
        type: 'setVar',
        var: 'character.intelligence',
        add: 1,
      },
    ],
    text: [
      {
        from: 'Twin',
        text: 'Rogue code isolated.',
      },
    ],
    next: 's1_pathB_next',
  },
  s1_pathB_retry_fail: {
    text: [
      {
        from: 'Twin',
        text: 'Circuit overload. Sparks fly.',
      },
    ],
    decision: [
      {
        text: 'Enter tunnels stealthily',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'stealth',
            },
          ],
          success: 's1_pathA_success',
          fail: 's1_pathA_fail',
        },
      },
      {
        text: 'Bail',
        next: 'bail',
      },
    ],
  },
  s1_pathC_success: {
    actions: [
      {
        type: 'setVar',
        var: 'character.charisma',
        add: 2,
      },
    ],
    text: [
      {
        from: 'narrator',
        text: 'Two security guards loiter near a barricade of crates and cables, arms folded, eyes scanning each person entering the tunnels. Fiber-optic lines vibrate through the floor, mixing with the mechanical whir of patrolling bots. Your approach must look effortless, confident—you have to make them think you belong.\nYou step forward, adjusting your posture and letting a carefully timed smile and casual nod meet their gaze. You kick a small wrench toward the crates at your feet; it clatters, catching their attention. One guard jerks to investigate, while the other follows the noise reflexively, leaning back just enough to let you slip past the checkpoint. It’ll be a close one, but if your timing and presence are convincing, the guards remain focused on the distraction rather than on you.',
      },
      {
        from: 'Twin',
        text: 'Guards distracted. Access secured.',
      },
    ],
    next: 's1_pathC_next',
  },
  s1_pathC_fail: {
    text: [
      {
        from: 'narrator',
        text: 'Two security guards loiter near a barricade of crates and cables, arms folded, eyes scanning each person entering the tunnels. Fiber-optic lines vibrate through the floor, mixing with the mechanical whir of patrolling bots. Your approach must look effortless, confident—you have to make them think you belong.\nYou step forward, adjusting your posture and letting a carefully timed smile and casual nod meet their gaze. You kick a small wrench toward the crates at your feet; it clatters, catching their attention. One guard jerks to investigate, while the other follows the noise reflexively, leaning back just enough to let you slip past the checkpoint. It’ll be a close one, but if your timing and presence are convincing, the guards remain focused on the distraction rather than on you.',
      },
      {
        from: 'Twin',
        text: 'Guards suspicious. Push too far and it’s tasers, not smiles.',
      },
    ],
    decision: [
      {
        text: 'Retry',
        dice: {
          dice: [1, 6],
          target: 5,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'charisma',
            },
          ],
          success: 's1_pathC_retry_success',
          fail: 's1_pathC_retry_fail',
        },
      },
      {
        text: 'Hack terminals',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's1_pathB_success',
          fail: 's1_pathB_fail',
        },
      },
      {
        text: 'Bail',
        next: 'bail',
      },
    ],
  },
  s1_pathC_retry_success: {
    actions: [
      {
        type: 'setVar',
        var: 'character.charisma',
        add: 1,
      },
    ],
    text: [
      {
        from: 'Twin',
        text: 'We blend in. Air hums quiet.',
      },
    ],
    next: 's1_pathC_next',
  },
  s1_pathC_retry_fail: {
    text: [
      {
        from: 'Twin',
        text: 'Guards alerted.',
      },
    ],
    decision: [
      {
        text: 'Hack terminals',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's1_pathB_success',
          fail: 's1_pathB_fail',
        },
      },
      {
        text: 'Bail',
        next: 'bail',
      },
    ],
  },
  s1_pathA_next: {
    next: 's2_selectPath',
  },
  s1_pathB_next: {
    next: 's2_selectPath',
  },
  s1_pathC_next: {
    next: 's2_selectPath',
  },
  s2_selectPath: {
    text: [
      {
        from: 'Twin',
        text: 'Subroutine’s flickering—it’s almost alive. Delete fully or keep copy?',
      },
    ],
    decision: [
      {
        text: 'Delete Fully',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's2_pathA_success',
          fail: 's2_pathA_fail',
        },
      },
      {
        text: 'Keep Copy',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's2_pathB_success',
          fail: 's2_pathB_fail',
        },
      },
    ],
  },
  s2_pathA_success: {
    actions: [
      {
        type: 'setVar',
        var: 'character.intelligence',
        add: 2,
      },
    ],
    text: [
      {
        from: 'Twin',
        text: 'Subroutine wiped. Grid stable.',
      },
    ],
    next: 's2_pathA_next',
  },
  s2_pathA_fail: {
    text: [
      {
        from: 'Twin',
        text: 'Deletion fails. Sparks fly.',
      },
    ],
    decision: [
      {
        text: 'Retry',
        dice: {
          dice: [1, 6],
          target: 5,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's2_pathA_retry_success',
          fail: 's2_pathA_retry_fail',
        },
      },
      {
        text: 'Keep Copy',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's2_pathB_success',
          fail: 's2_pathB_fail',
        },
      },
    ],
  },
  s2_pathA_retry_success: {
    actions: [
      {
        type: 'setVar',
        var: 'character.intelligence',
        add: 1,
      },
    ],
    text: [
      {
        from: 'Twin',
        text: 'Subroutine deleted. Grid safe.',
      },
    ],
    next: 's2_pathA_next',
  },
  s2_pathA_retry_fail: {
    text: [
      {
        from: 'Twin',
        text: 'Sparks flare.',
      },
    ],
    decision: [
      {
        text: 'Keep Copy',
        dice: {
          dice: [1, 6],
          target: 4,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's2_pathB_success',
          fail: 's2_pathB_fail',
        },
      },
      {
        text: 'Bail',
        next: 'bail',
      },
    ],
  },
  s2_pathB_success: {
    actions: [
      {
        type: 'setVar',
        var: 'character.intelligence',
        add: 2,
      },
    ],
    text: [
      {
        from: 'Twin',
        text: 'Stashed copy in secure drive.',
      },
    ],
    next: 's2_pathB_next',
  },
  s2_pathB_fail: {
    text: [
      {
        from: 'Twin',
        text: 'Copy corrupted.',
      },
    ],
    decision: [
      {
        text: 'Retry',
        dice: {
          dice: [1, 6],
          target: 5,
          bonuses: [
            {
              type: 'characterAttribute',
              attribute: 'intelligence',
            },
          ],
          success: 's2_pathB_retry_success',
          fail: 's2_pathB_retry_fail',
        },
      },
      {
        text: 'Bail',
        next: 'bail',
      },
    ],
  },
  s2_pathB_retry_success: {
    actions: [
      {
        type: 'setVar',
        var: 'character.intelligence',
        add: 1,
      },
    ],
    text: [
      {
        from: 'Twin',
        text: 'Copy secured.',
      },
    ],
    next: 's2_pathB_next',
  },
  s2_pathB_retry_fail: {
    text: [
      {
        from: 'Twin',
        text: 'Copy lost.',
      },
    ],
    decision: [
      {
        text: 'Bail',
        next: 'bail',
      },
    ],
  },
  s2_pathA_next: {
    next: 'success_end',
  },
  s2_pathB_next: {
    next: 'success_end',
  },
  success_end: {
    actions: [
      {
        type: 'setVar',
        var: 'character.credits',
        add: 25,
      },
    ],
    text: [
      {
        from: 'Twin',
        text: 'Signal gone. Grid hums normal. Walk out clean.',
      },
    ],
    next: 'end',
  },
  bail: {
    actions: [
      {
        type: 'setVar',
        var: 'character.credits',
        add: -10,
      },
    ],
    text: [
      {
        from: 'Twin',
        text: 'Rogue subroutine remains active. Smoke cleared, but the grid needs monitoring.',
      },
    ],
    next: 'end',
  },
};

export default { metadata, story } as GigStoryWithMetadata;
