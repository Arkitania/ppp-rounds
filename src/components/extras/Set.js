import { useDispatch } from "react-redux";
import { cancelSet } from "../store/rounds-slice";

function Set(props) {
  const dispatch = useDispatch();

  const cancelHandler = () => {
    dispatch(cancelSet({ player1: props.p1, player2: props.p2 }));
  };

  return (
    <div className="set">
      <p className="set__players">{`${props.p1} VS ${props.p2}`}</p>
      <button className="set__cancel" onClick={cancelHandler}>
        Cancelar
      </button>
    </div>
  );
}

export default Set;
