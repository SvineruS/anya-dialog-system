import { MissionStatePart, Status, UserStatePart } from "../../GigSystem/types/state";


export class Repository {
  private users: { [userId: string]: UserStatePart };
  private missions: { [userId: string]: { [gigId: string]: MissionStatePart } };

  constructor() {
    this.users = {};
    this.missions = {};
  }

  public getUserState(userId: string): UserStatePart {
    return this.users[userId];
  }

  public getUserMission(userId: string, gigId: string): MissionStatePart {
    return this.missions[userId]?.[gigId];
  }

  public getUserMissions(userId: string): { id: string, status: Status }[] {
    const userMissions = this.missions[userId] ?? {};
    return Object.entries(userMissions).map(
      ([id, mission]) => ({ id: id, status: mission.engine.status })
    );
  }


  public saveUserState(userId: string, state: UserStatePart) {
    this.users[userId] = state;
    console.log(`Saving user ${userId} state`, state);
  }

  public saveUserMission(userId: string, gigId: string, state: MissionStatePart) {
    if (!this.missions[userId]) this.missions[userId] = {};
    this.missions[userId][gigId] = state;
    console.log(`Saving user ${userId} mission ${gigId} state`, state);
  }

}
