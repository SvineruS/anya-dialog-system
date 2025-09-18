import { GigStoryGraph } from "../../types/gigStory";
import { GigMetadata, GigStoryWithMetadata } from "../../types/gig";

const metadata: GigMetadata = {
  id: "corp_gig_1",
  name: "Corporate Offer",
  description: "A mysterious stranger offers you a gig with a corporation. Your choices will shape your path in the neon-lit city.",
  image: "https://example.com/corp_gig_image.png",
  location: "southAscendia",
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
      { from: "narrator", text: "You wake up in your cramped capsule apartment. Neon leaks in from the window." },
      { from: "narrator", text: "You get ready for the day. The city hums outside." }
    ],
    next: "street"
  },

  street: {
    text: [
      { from: "narrator", text: "You step out into the street. On the way to the bar, a stranger approaches." },
      { from: "stranger", text: "I represent a corporation that could use your talents. Want to talk terms?" },
      { from: "you", text: "Depends on the terms." },
      {
        from: "stranger",
        text: "You just need to show up when we call. Pay is good. We will give you all required tools"
      },
      { from: "you", text: "What kind of work?" },
      { from: "stranger", text: "Classified. But lucrative." }
    ],
    next: "corp_offer"
  },

  corp_offer: {
    text: [
      { from: "stranger", text: "So, what do you say?" }
    ],
    decision: [
      { text: "Refuse", next: "corp_refuse" },
      { text: "Accept terms", next: "corp_accept" },
      { text: "Take time to think", next: "corp_wait" }
    ]
  },

  corp_refuse: {
    actions: [
      {type: "setVar", var: "gigState.refused", set: 1}
    ],
    text: [
      { from: "you", text: "Not interested." },
      { from: "stranger", text: "Suit yourself." }
    ],
    next: "bar_entry"
  },

  corp_accept: {
    actions: [
      {type: "setVar", var: "gigState.accepted", set: 1}
    ],
    text: [
      { from: "you", text: "I’m in." },
      { from: "stranger", text: "Good. We’ll be in touch soon." }
    ],
    next: "bar_entry"
  },

  corp_wait: {
    actions: [
      {type: "setVar", var: "gigState.waited", set: 1}
    ],
    text: [
      { from: "you", text: "I need some time to think." },
      { from: "stranger", text: "Fair enough. The offer stands." }
    ],
    next: "bar_entry"
  },


  bar_entry: {
    text: [
      { from: "narrator", text: "You arrive at the bar. Neon signs buzz above the doorway." },
      { from: "bouncer", text: "ID and 10 credits cover charge." },
      { from: "you", text: "Here you go." },
      { from: "bouncer", text: "Enjoy your night." }

    ],
    next: "bar_choices"
  },

  bar_choices: {
    decision: [
      { text: "Order a drink (-10 credits)", cost: { type: "credits", amount: 10 }, next: "buy_drink" },
      { text: "Talk to the bartender", next: "bartender_dialogue" },
      { text: "Leave the bar", next: "bar_leave" }
    ]
  },


  buy_drink: {
    text: [
      { from: "bartender", text: "Here’s your drink." }
    ],
    actions: [
      { type: "setVar", var: "gigState.barDrinks", add: 1 }
    ],
    branch: {
      switch: "gigState.barDrinks > 3",
      true: "end_drunk",
      default: "bar_choices"
    }
  },

  end_drunk: {
    actions: [
      {type: "setVar", var: "globalState.corpGigEnding", set: 1}
    ],
    text: [
      { from: "you", text: "I am going to piss myself now" },
      { from: "narrator", text: "After too many drinks, the world spins. The gig ends here." }
    ],
    next: "end"
  },



  bartender_dialogue: {
    decision: [
      { text: "Smalltalk", next: "bartender_smalltalk" },
      {
        text: "Sneak up (convince bartender to spill info)",
        dice: {
          dice: [2, 6],
          target: 14,
          bonuses: [
            { type: "characterAttribute", attribute: "charisma" },
            { type: "condition", condition: "gigState.waited == 1", amount: +2, text: "You didn't answer to corp yet" },
            { type: "condition", condition: "gigState.barDrinks >= 1", amount: 1, text: "You ordered something" },
            { type: "condition", condition: "gigState.barDrinks >= 2", amount: 2, text: "Loosened tongue" },
            { type: "condition", condition: "gigState.failWithBartender == 1", amount: -3, text: "Previous attempt was miserable" }
          ],
          success: "bartender_success",
          fail: "bartender_fail"
        }
      }
    ]
  },

  bartender_smalltalk: {
    text: [
      { from: "you", text: "The city never sleeps, huh? Same faces, same neon." },
      { from: "bartender", text: "Yea.." }
    ],
    next: "bar_choices"
  },

  bartender_success: {
    actions: [
      { type: "setVar", var: "globalState.knowCorpGuy", set: 1 }
    ],
    text: [
      { from: "you", text: "I am invited to my first job at a corporation btw ;3" },
      { from: "bartender", text: "That corp recruiter you met? Rumor is he’s got debts with the Yakuza." }
    ],
    next: "bar_choices"
  },

  bartender_fail: {
    actions: [
      { type: "setVar", var: "gigState.failWithBartender", set: 1 }
    ],
    branch: {
      switch: "gigState.barDrinks > 0",
      true: "bartender_fail_when_drunk",
      default: "bartender_fail_when_sober"
    }
  },

  bartender_fail_when_drunk: {
    text: [
      { from: "you", text: "i'll do shit with corporats buddy uknow" },
      { from: "bartender", text: "Go get some sleep" }
    ],
    next: "bar_choices"
  },

  bartender_fail_when_sober: {
    text: [
      { from: "you", text: "You know man named Yasos Biba?" },
      { from: "bartender", text: "I don’t gossip with customers." }
    ],
    next: "bar_choices"
  },

  bar_leave: {
    text: [
      { from: "narrator", text: "You leave the bar, the neon fading into the night." },
    ],
    branch: {
      switch: "gigState.waited",
      true: "corp_decision_final",
      default: "end"
    }
  },

  corp_decision_final: {
    text: [
      { from: "you", text: "I need to answer that corp" }
    ],
    decision: [
      { text: "Accept the corp job", next: "corp_accept_final" },
      { text: "Refuse the corp job", next: "corp_refuse_final" }
    ]
  },

  corp_accept_final: {
    actions: [
      {type: "setVar", var: "globalState.corpGigEnding", set: 2}
    ],
    text: [
      { from: "you", text: "Alright, I’ll take the job." },
      { from: "stranger", text: "Good. You’ll hear from us soon." }
    ],
    next: "end",
  },

  corp_refuse_final: {
    actions: [
      {type: "setVar", var: "globalState.corpGigEnding", set: 3}
    ],
    text: [
      { from: "you", text: "No, I don’t want to work for you." },
      { from: "stranger", text: "Your loss." }
    ],
    next: "end"
  }

};

export default { metadata, story } as GigStoryWithMetadata;
