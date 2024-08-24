
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";


const adminIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});


const pilotIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [30, 30],
});

const Map = () => {
  const adminLocation = [51.505, -0.09];
  const [latitude, setLatitude] = useState(80.5);
  const [longitude, setLongitude] = useState(30.5);
  const [matchRange, setMatchRange] = useState(1000);
  const [filterRange, setFilterRange] = useState(300);
  const [matchedPilots, setMatchedPilots] = useState([]);
  const [filteredPilots, setFilteredPilots] = useState([]);


  const calculateDistance = (coord1, coord2) => {
    const R = 6371; 
    const latDiff = ((coord2[0] - coord1[0]) * Math.PI) / 180;
    const lonDiff = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos((coord1[0] * Math.PI) / 180) *
        Math.cos((coord2[0] * Math.PI) / 180) *
        Math.sin(lonDiff / 2) *
        Math.sin(lonDiff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };


  const fetchPilots = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/pilots");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch pilots", error);
      return [];
    }
  };

  const findTopMatches = async () => {
    const pilots = await fetchPilots();
    const inputCoords = [latitude, longitude];

    const topMatches = pilots
      .map((pilot) => ({
        ...pilot,
        distance: calculateDistance(inputCoords, pilot.coordinates),
      }))
      .filter((pilot) => pilot.distance <= matchRange)
      .sort((a, b) => b.experience - a.experience || a.distance - b.distance)
      .slice(0, 10);

    setMatchedPilots(topMatches);
  };

  const filterPilotsByRange = async () => {
    const pilots = await fetchPilots();
    const filtered = pilots.filter(
      (pilot) => calculateDistance(adminLocation, pilot.coordinates) <= filterRange
    );
    setFilteredPilots(filtered);
  };

  useEffect(() => {
    filterPilotsByRange();
  }, [filterRange]);

  useEffect(() => {
    console.log("Latitude or Longitude changed:", { latitude, longitude });

    findTopMatches();
  }, [latitude, longitude]);

  return (
    <div style={{ position: "relative" }}>
      <MapContainer center={adminLocation} zoom={4} style={{ height: "500px" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={adminLocation} icon={adminIcon}>
          <Popup>
            <strong>Admin Location</strong>
            <br />
            This is the admin's location.
          </Popup>
        </Marker>
        {matchedPilots.map((pilot) => (
          <Marker
            key={pilot._id}
            position={pilot.coordinates}
            icon={pilotIcon}
          >
            <Popup>
              <strong>{pilot.name}</strong>
              <br />
              Experience: {pilot.experience} years
              <br />
              Distance: {pilot.distance.toFixed(2)} km
              <br />
              Location: {pilot.location}
              <br />
              <img
                src={pilot.profileImage}
                alt={pilot.name}
                style={{ width: "100px", height: "42px" , background:"black"}}
              />
            </Popup>
          </Marker>
        ))}
        {filteredPilots.map((pilot) => (
          <Marker
            key={pilot._id}
            position={pilot.coordinates}
            icon={pilotIcon}
          >
            <Popup>
              <strong>{pilot.name}</strong>
              <br />
              Experience: {pilot.experience} years
              <br />
              Location: {pilot.location}
              <br />
              <img
                src={pilot.profileImage}
                alt={pilot.name}
                style={{ width: "100px", height: "42px" , background:"black"}}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div style={styles.formContainer}>
        <div style={styles.formSection}>
          <h3>Find Top 10 Pilots</h3>
          <label style={styles.label}>Latitude:</label>
          <input
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
            style={styles.input}
          />
          <label style={styles.label}>Longitude:</label>
          <input
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
            style={styles.input}
          />
          <label style={styles.label}>Range (km):</label>
          <input
            type="number"
            value={matchRange}
            onChange={(e) => setMatchRange(parseFloat(e.target.value))}
            style={styles.input}
          />
          <button onClick={findTopMatches} style={styles.button}>
            Find Top Matches
          </button>
        </div>

        <div style={styles.formSection}>
          <h3>Filter by Range from Admin</h3>
          <label style={styles.label}>Filter Range (km):</label>
          <input
            type="number"
            value={filterRange}
            onChange={(e) => setFilterRange(parseFloat(e.target.value))}
            style={styles.input}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  formContainer: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    width: "300px",
  },
  formSection: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    backgroundColor: "#007BFF",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  },
};

export default Map;
