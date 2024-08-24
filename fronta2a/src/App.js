
import React from "react";
import Map from "./components/Map";

function App() {
  return (
    <div className="App" style={{  background:"black"}}>
      {/* <h1>Drone Pilot Map</h1> */}
      <img
                src="https://res.cloudinary.com/daaeq1zas/image/upload/v1720171078/aero2astrospace_m45zyp.png"
                // alt={pilot.name}
                style={{ width: "500px", height: "100px" , background:"black"}}
              />
      <Map />
    </div>
  );
}

export default App;
