import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { assignStationSet, freeStation } from "../store/rounds-slice";

function Controller() {
  const dispatch = useDispatch();
  const stationRef = useRef();

  const stations = useSelector((state) => state.rounds.stations);
  const nextSet = useSelector((state) => {
    return state.rounds.sets.find(
      (set) =>
        set.state === "pending" &&
        state.rounds.players.find((player) => player.player === set.player1)
          ?.available &&
        state.rounds.players.find((player) => player.player === set.player2)
          ?.available
    );
  });

  const generateStations = () => {
    return stations.map((station) => (
      <option value={station.index} key={station.index}>
        Estación {station.index}
      </option>
    ));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const stationValue = +stationRef.current.value;

    const selected = stations.find((s) => s.index === stationValue);

    if (!nextSet) return;
    if (selected.set !== null) return;

    dispatch(assignStationSet({ set: nextSet, station: stationValue }));
  };

  const finishHandler = (e) => {
    e.preventDefault();
    const stationValue = +stationRef.current.value;
    const selected = stations.find((s) => s.index === stationValue);
    if (selected.set == null) return;
    dispatch(freeStation(stationValue));
  };

  return (
    <form className="controller mt-sm" onSubmit={submitHandler}>
      <div className="controller__set">
        <h3 className="controller__title">Próximo Set</h3>
        <div className="controller__next">
          {nextSet && (
            <>
              <p className="controller__p1">{nextSet.player1}</p>
              <p className="controller__vs">VS</p>
              <p className="controller__p2">{nextSet.player2}</p>
            </>
          )}

          {!nextSet && <p className="controller__p1">...</p>}
        </div>
      </div>

      <div className="controller__controls">
        <select
          name="station"
          id="station"
          className="controller__station"
          ref={stationRef}
        >
          {generateStations()}
        </select>

        <button className="controller__green">Enviar</button>
        <button className="controller__red" onClick={finishHandler}>
          Terminar
        </button>
      </div>
    </form>
  );
}

export default Controller;
