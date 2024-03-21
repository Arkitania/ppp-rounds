import { useSelector } from "react-redux";
import { Fragment, useEffect } from "react";

import "./sass/main.scss";
import InitialForm from "./components/Initial/InitialForm";
import Layout from "./components/Layout";
import Sidebar from "./components/sidebar/Sidebar";
import Stations from "./components/Stations/Stations";
import Extras from "./components/extras/Extras";

function App() {
  const start = useSelector((state) => state.rounds.started);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const message = "¿Seguro desea salir de la app?";
      event.returnValue = message;
      return message;
    };

    // Add the event listener when the App component mounts
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Remove the event listener when the App component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <Fragment>
      {start && (
        <Layout>
          <Sidebar />
          <Stations stationsCount={5} />
          <Extras />
        </Layout>
      )}
      {!start && <InitialForm />}
    </Fragment>
  );
}

export default App;
