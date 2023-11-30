import { useSelector } from "react-redux";
import Station from "./Station";

function Stations() {
  const stations = useSelector((state) => state.rounds.stations);
  const stationSets = useSelector((state) => {
    const stationSets = [];
    stations.forEach((st) => {
      if (st.set !== null) {
        stationSets.push({
          station: st.index,
          setData: state.rounds.sets[st.set],
        });
      }
    });
    return stationSets;
  });

  const generateStations = () => {
    return stations.map((station) => {
      if (station.set == null)
        return (
          <Station pending={true} id={station.index} key={station.index} />
        );

      const stationData = stationSets.find(
        (set) => set.station === station.index
      );

      return (
        <Station
          p1={stationData.setData.player1}
          p2={stationData.setData.player2}
          key={station.index}
          id={station.index}
        />
      );
    });
  };

  return <section className="stations p-main-cy">{generateStations()}</section>;
}

export default Stations;
