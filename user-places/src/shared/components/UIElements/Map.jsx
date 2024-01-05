import "./Map.css";

const Map = (props) => {
  return (
    <div className={`map ${props.className}`} style={props.style}>
      <img
        src="https://images.unsplash.com/photo-1476385822777-70eabacbd41f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1548&q=80"
        alt="map-image"
        width={"100%"}
        height={"100%"}
      />
    </div>
  );
};

export default Map;
