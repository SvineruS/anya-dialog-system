import { GigGame } from "../../GigSystem/gameEngine/gigGame";
import { GigState, MissionStatePart, UserStatePart } from "../../GigSystem/types/state";
import { NodeId } from "../../GigSystem/types/common";
import { Repository } from "../repositories/repository";
import { getAllGigs } from "../../GigSystem/gameData/gigs";


const defaultUser: UserStatePart = {
  character: {
    strength: 1,
    intelligence: 1,
    charisma: 1,
    marksmanship: 1,
    stealth: 1,

    tier: 1,
    streetCred: 0,
    credits: 100,
  },
  inventory: {},
  globalState: {},
}

const emptyMissionState: MissionStatePart = {
  engine: { currentNodeId: 'start', status: 'in-progress' },
  gigState: {},
  gigHistory: [],
};



export class GameService {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }


  getMissions(userId: string) {
    const userMissions = this.repository.getUserMissions(userId);
    const userMissionsById: Record<string, any> = {};
    userMissions.forEach(m => userMissionsById[m.id] = m);

    const allMissions = getAllGigs();

    return allMissions.map(mission => {
      const userMission = userMissionsById[mission.metadata.id];

      return {
        ...mission.metadata,
        status: userMission?.status,
      };
    });
  }

  public startGame(userId: string, gigId: string): any {
    const user = this.getUser(userId);
    const userMission = this.repository.getUserMission(userId, gigId);
    if (userMission) throw new Error('Mission already started');

    const state: GigState = { ...user, ...JSON.parse(JSON.stringify(emptyMissionState)) };

    // this updates state in place
    const game = GigGame.createNewGame(state, gigId);

    this.saveState(userId, gigId, state);

    return game.show()
  }

  public showGame(userId: string, gigId: string) {
    const game = this.getGame(userId, gigId);
    return game.show();
  }

  public makeDecision(userId: string, gigId: string, nodeId: NodeId, decisionIndex?: number, retry?: boolean) {
    const game = this.getGame(userId, gigId);
    // this updates state in place
    const result = game.makeDecision(nodeId, decisionIndex, retry);
    this.saveState(userId, gigId, game.state);
    return {game: game.show(), result};
  }


  private getGame(userId: string, gigId: string): GigGame {
    const user = this.getUser(userId);
    const userMission = this.repository.getUserMission(userId, gigId);
    if (!userMission || userMission.engine.status !== 'in-progress')
      throw new Error('Mission not in progress');

    const state: GigState = { ...user, ...userMission };

    return new GigGame(state, gigId);
  }




  private getUser(userId: string): UserStatePart {
    let user = this.repository.getUserState(userId);
    if (user)
      return user;
    return defaultUser;
  }

  private saveState(userId: string, gigId: string, state: GigState) {
    // todo use stateProxy to track changes and only save diffs

    const userState = {
      character: state.character,
      inventory: state.inventory,
      globalState: state.globalState
    }
    const missionState = {
      engine: state.engine,
      gigState: state.gigState,
      gigHistory: state.gigHistory,
    }

    this.repository.saveUserState(userId, userState);
    this.repository.saveUserMission(userId, gigId, missionState);

  }
}

