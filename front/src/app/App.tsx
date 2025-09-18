import { useEffect, useState } from "react";
import { getMissions, startGigGame } from "../backends.ts";
import { MissionToSelect } from "../../../back/src/types/front/gigFrontTypes.ts";
import Game from "./Game.tsx";


export default function App() {
  const [gameId, setGameId] = useState<string | null>(null);

  if (!gameId)
    return <MissionSelector handleSelect={(id) => setGameId(id)}/>;
  return (
    <div>
      <button onClick={() => setGameId(null)}>Back to Missions</button>
      <hr/>
      <Game gameId={gameId}/>
    </div>
  )

}


function MissionSelector(props: {
  handleSelect: (gigId: string) => void
}) {

  const [missions, setMissions] = useState<MissionToSelect[]>([]);

  useEffect(() => {
    (async () => {
      setMissions(await getMissions());
    })();
  }, []);


  async function handleStartMission(missionId: string) {
    await startGigGame(missionId);
    props.handleSelect(missionId);
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Select a Mission</h2>
      {missions.map((mission) => (
        <div key={mission.id} style={{ border: "1px solid #444", padding: "0.5rem", marginBottom: "0.5rem" }}>
          <h3>{mission.name}</h3>
          <p>Location: {mission.location}</p>
          <p>Tier: {mission.tier}</p>

          <p>Status: {mission.status ?? "not-started"}</p>
          <p>Client: {mission.client}</p>
          <p>Affiliation: {mission.affiliation}</p>
          <p>Start Cost: {mission.startCost} credits</p>

          <p>{mission.description}</p>
          <p>Rewards: {mission.rewards.credits} credits, {mission.rewards.reputation} reputation, {mission.rewards.xp} XP</p>

          {
            mission.status == undefined ?
              <button onClick={() => handleStartMission(mission.id)}>Start Mission</button> :
              mission.status == "in-progress" ?
                <button onClick={() => props.handleSelect(mission.id)}>Continue Mission</button> :
                <span>Mission Completed</span>
          }

        </div>
      ))}
    </div>
  );
}


