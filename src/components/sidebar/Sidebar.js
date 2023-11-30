import Progress from "./Progress";
import Controller from "./Controller";

function Sidebar() {
  return (
    <section className="sidebar p-main-c">
      <Progress />
      <Controller />
    </section>
  );
}

export default Sidebar;
