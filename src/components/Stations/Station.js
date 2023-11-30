function Station(props) {
  return (
    <div className="station">
      <figure className="station__id">
        <p className="station__num">{props.id}</p>
      </figure>
      <p className="station__players">
        {props.pending && "Por determinar..."}
        {!props.pending && (
          <>
            {props.p1} <span className="station__vs">VS</span> {props.p2}
          </>
        )}
      </p>
    </div>
  );
}

export default Station;
