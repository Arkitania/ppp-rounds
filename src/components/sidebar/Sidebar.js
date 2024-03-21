import Progress from "./Progress";
import Controller from "./Controller";

function Sidebar() {
  return (
    <section className="sidebar p-main-c">
      <Progress />
      <Controller />
      <div className="powered">
        <p className="powered__title">Desarrollado por</p>
        <img
          src="/img/ojo2.png"
          alt="Ojo al cuadrado"
          className="powered__img"
        />
      </div>
    </section>
  );
}

export default Sidebar;
