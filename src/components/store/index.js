import { configureStore } from "@reduxjs/toolkit";
import roundsReducer from "./rounds-slice";

const store = configureStore({
  reducer: { rounds: roundsReducer },
});

export default store;
