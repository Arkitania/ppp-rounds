import { createSlice } from "@reduxjs/toolkit";

const initalRoundsState = {
  numPlayers: 0,
  stations: [],
  players: [],
  sets: [],
  started: false,
};

const generateSets = (players) => {
  const sets = [];
  const rotation = Array.from(
    { length: players.length - 1 },
    (_, index) => index + 1
  );

  for (let round = 0; round < players.length - 1; round++) {
    for (let i = 0; i < players.length; i++) {
      const player1 = players[i].player;
      const player2 = players[(i + rotation[round]) % players.length].player;

      // Check if the set already exists
      const setExists = sets.some(
        (set) =>
          (set.player1 === player1 && set.player2 === player2) ||
          (set.player1 === player2 && set.player2 === player1)
      );

      if (!setExists) {
        sets.push({
          player1,
          player2,
          state: "pending",
        });
      }
    }
  }

  sets.sort((setA, setB) => {
    const playerA = setA.player1.localeCompare(setA.player2);
    const playerB = setB.player1.localeCompare(setB.player2);

    if (playerA === playerB) {
      const lastMatchupA = getLastMatchupIndex(sets, setA);
      const lastMatchupB = getLastMatchupIndex(sets, setB);

      return lastMatchupA - lastMatchupB;
    }

    return playerA - playerB;
  });

  return sets;
};

const getLastMatchupIndex = (sets, currentSet) => {
  const lastMatchupIndex = sets
    .slice()
    .reverse()
    .findIndex(
      (set) =>
        (set.player1 === currentSet.player1 &&
          set.player2 === currentSet.player2) ||
        (set.player1 === currentSet.player2 &&
          set.player2 === currentSet.player1)
    );

  return lastMatchupIndex !== -1 ? sets.length - 1 - lastMatchupIndex : -1;
};

const roundsSlice = createSlice({
  name: "rounds",
  initialState: initalRoundsState,
  reducers: {
    startApp: (state, action) => {
      if (state.started) return;
      state.players = action.payload.players;
      state.sets = generateSets(action.payload.players);
      state.stations = Array.from(
        { length: +action.payload.stations },
        (_, index) => ({ index: index + 1, available: true, set: null })
      );
      state.started = true;
    },

    toggleUserA: (state, action) => {
      const playerTag = action.payload;
      const player = state.players.find((pj) => pj.player === playerTag);
      player.available = !player.available;

      const updatedPlayers = state.players.map((pj) => {
        if (pj.player !== playerTag) return pj;
        return player;
      });

      state.players = updatedPlayers;

      const updatedSets = state.sets.map((s) => {
        if (s.player1 === playerTag || s.player2 === playerTag) {
          const opponent = `${s.player1 === playerTag ? "player2" : "player1"}`;
          const updatedSet = { ...s };

          if (s.state === "completed") return s;

          if (!player.available) updatedSet.state = "unavailble";

          if (player.available) {
            const opponentData = state.players.find(
              (pj) => pj.player === s[opponent]
            );
            if (opponentData.available) updatedSet.state = "pending";
            if (!opponentData.available) updatedSet.state = "unavailable";
          }

          return updatedSet;
        }
        return s;
      });

      state.sets = updatedSets;
    },

    assignStationSet: (state, action) => {
      const data = action.payload;
      const setIndex = state.sets.findIndex(
        (s) => s.player1 === data.set.player1 && s.player2 === data.set.player2
      );

      const updatedStations = state.stations.map((s) => {
        const station = { ...s };
        if (s.index !== data.station) return station;
        station.set = setIndex;
        return station;
      });

      const updatedSets = state.sets.map((set, i) => {
        const updatedSet = { ...set };
        if (i !== setIndex) return updatedSet;
        updatedSet.state = "playing";
        return updatedSet;
      });

      const updatedPlayers = state.players.map((pj) => {
        if (pj.player !== data.set.player1 && pj.player !== data.set.player2)
          return pj;
        return { player: pj.player, available: false };
      });

      state.stations = updatedStations;
      state.sets = updatedSets;
      state.players = updatedPlayers;
    },

    freeStation: (state, action) => {
      const stationIndex = action.payload;
      const stationSet = state.stations.find((s) => s.index === stationIndex);

      const setData = { ...state.sets[stationSet.set] };

      const updatedPlayers = state.players.map((pj) => {
        if (pj.player !== setData.player1 && pj.player !== setData.player2)
          return pj;
        return { player: pj.player, available: true };
      });

      const updatedStations = state.stations.map((s) => {
        const station = { ...s };
        if (s.index !== stationIndex) return station;
        station.set = null;
        return station;
      });

      const updatedSets = state.sets.map((set, i) => {
        const updatedSet = { ...set };
        if (i === stationSet.set) updatedSet.state = "completed";
        return updatedSet;
      });

      state.stations = updatedStations;
      state.players = updatedPlayers;
      state.sets = updatedSets;
    },

    cancelSet: (state, action) => {
      const setData = action.payload;

      const updatedSets = state.sets.map((set) => {
        const updatedSet = { ...set };
        if (
          set.player1 === setData.player1 &&
          set.player2 === setData.player2
        ) {
          updatedSet.state = "pending";
          return updatedSet;
        }

        return updatedSet;
      });

      state.sets = updatedSets;
    },
  },
});

export const { startApp } = roundsSlice.actions;
export const { toggleUserA } = roundsSlice.actions;
export const { assignStationSet } = roundsSlice.actions;
export const { freeStation } = roundsSlice.actions;
export const { cancelSet } = roundsSlice.actions;

export const getRoundsProgress = (state) => {
  const totalSets = state.rounds.sets.length;
  const completedSets = state.rounds.sets.filter(
    (set) => set.state === "completed"
  ).length;

  return (completedSets / totalSets) * 100;
};

export default roundsSlice.reducer;
