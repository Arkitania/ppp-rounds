import { useSelector } from "react-redux";
import Player from "./Player";

function Players(props) {
  const players = useSelector((state) => state.rounds.players);

  const generatePlayers = () => {
    return players.map((pj) => (
      <Player player={pj.player} available={pj.available} key={pj.player} />
    ));
  };

  return (
    <div className="players">
      <div className="players__container">
        <div className="players__icontainer">
          <div className="players__items">{generatePlayers()}</div>
        </div>
      </div>
    </div>
  );
}

export default Players;
