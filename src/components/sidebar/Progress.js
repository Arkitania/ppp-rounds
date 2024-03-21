import { useSelector } from "react-redux";
import { getRoundsProgress } from "../store/rounds-slice";

function Progress() {
  const progress = useSelector(getRoundsProgress);

  const dashoffset = ((100 - progress) / 100) * 285;

  return (
    <div className="progress">
      <figure className="progress__fig">
        <img className="progress__img" src="/img/ssbLogo.png" alt="Logo PPP" />
        <svg className="progress__svg" viewBox="0 0 100 100">
          <circle
            className="progress__circle"
            id="progress-circle"
            cx="50"
            cy="50"
            r="45"
            strokeDashoffset={dashoffset}
          />
        </svg>
      </figure>
      <p className="progress__text">Progreso {Math.round(progress)}%</p>
    </div>
  );
}

export default Progress;
