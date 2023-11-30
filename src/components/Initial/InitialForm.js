import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { startApp } from "../store/rounds-slice";

function InitialForm() {
  const dispatch = useDispatch();

  const stationsRef = useRef();
  const [totalP, setTotalP] = useState(0);
  const [playerInputs, setPlayerInputs] = useState(Array(totalP).fill(""));

  const handlePlayers = (e) => {
    const value = +e.target.value;
    if (!value) return;
    setTotalP(value);
    setPlayerInputs(Array(value).fill(""));
  };

  const handlePlayerNameChange = (index, e) => {
    const newPlayerNames = [...playerInputs];
    newPlayerNames[index] = e.target.value;
    setPlayerInputs(newPlayerNames);
  };

  const generatePlayers = (pNum) => {
    return playerInputs.map((name, i) => (
      <input
        type="text"
        className="start-form__input"
        placeholder="Nickname"
        onChange={(e) => handlePlayerNameChange(i, e)}
        value={name}
        required
        key={i}
      />
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emptyName = playerInputs.reduce((acc, cur) => cur.trim() === "");
    if (emptyName) return;

    const players = playerInputs.map((pj) => ({ player: pj, available: true }));

    dispatch(startApp({ players, stations: stationsRef.current.value }));
  };

  return (
    <div className="start-form__container">
      <form className="start-form" onSubmit={handleSubmit}>
        <h3 className="start-form__title">PPP Round Robin</h3>
        <div className="start-form__main my-md">
          <input
            type="number"
            className="start-form__input"
            placeholder="Numero de participantes"
            min={3}
            max={30}
            onChange={handlePlayers}
            required
          />
          <input
            type="number"
            className="start-form__input"
            placeholder="Numero de Estaciones"
            min={1}
            max={10}
            ref={stationsRef}
            required
          />
        </div>

        <div className="start-form__players">
          {totalP >= 3 && generatePlayers()}
        </div>

        <button className="start-form-start btn btn__green mt-md">
          Empezar
        </button>
      </form>
    </div>
  );
}

export default InitialForm;
