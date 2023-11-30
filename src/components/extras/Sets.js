import { useSelector } from "react-redux";
import Set from "./Set";

function Sets() {
  const sets = useSelector((state) => {
    return state.rounds.sets.filter((set) => set.state === "completed");
  });

  const generateSets = () => {
    return sets.map((set) => <Set p1={set.player1} p2={set.player2} />);
  };

  return (
    <div className="sets">
      <h3 className="sets__title">Terminados</h3>
      <div className="sets__container">
        <div className="sets__items">{generateSets()}</div>
      </div>
    </div>
  );
}

export default Sets;
