import { useDispatch } from "react-redux";
import { toggleUserA } from "../store/rounds-slice";

function Player(props) {
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(toggleUserA(props.player));
  };

  return (
    <div className="player">
      <p className="player__player">{props.player}</p>
      <button
        className={`player__state ${!props.available && "player__state--red"}`}
        onClick={handleToggle}
      >{`${props.available ? "Disponible" : "No Disponible"}`}</button>
    </div>
  );
}

export default Player;
