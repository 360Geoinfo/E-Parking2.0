import React, { useEffect, useState } from "react";
import { useSocket } from "../../../context/socket";
import { MapContainer, Polygon, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ZoneCoordinates from "../../components/ZoneCoordinates";

const Zones = () => {
  const { zoneList, isLoading } = useSocket();
  const [showAddCoordinates, setShowAddCoordinates] = useState(null);

  useEffect(() => {
    console.log("Zone list:", zoneList);
  }, [zoneList]);

  // Render a map for a given zone area object
  const renderMapForArea = (area) => {
    let center = [4.887051, 114.942906];
    let polygonCoordinates = [];

    try {
      const parsedCenter = JSON.parse(area.CENTER);
      center = [parsedCenter.latitude, parsedCenter.longitude];
      polygonCoordinates = Array.isArray(area.VECTORS)
        ? area.VECTORS.map((v) => [v.latitude, v.longitude])
        : [];
    } catch (err) {
      console.error("Error parsing zone area center or vectors:", err);
    }

    return (
      <MapContainer
        center={center}
        zoom={17}
        style={{ height: "120px", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {polygonCoordinates.length > 0 && (
          <Polygon
            positions={polygonCoordinates}
            pathOptions={{
              color: "blue",
              fillColor: "lightblue",
              fillOpacity: 0.5,
            }}
          />
        )}
      </MapContainer>
    );
  };

  if (isLoading) return <p className="text-center">Fetching Zone List...</p>;
  if (!Array.isArray(zoneList) || zoneList.length === 0)
    return <p className="text-center">No zones available.</p>;

  return (
    <div className="w-full flex flex-col p-4">
      {showAddCoordinates && (
        <div className="z-[10000] fixed inset-0 bg-gray-800/50 flex justify-center items-center">
          <ZoneCoordinates
            zoneId={showAddCoordinates}
            setShowAddCoordinates={setShowAddCoordinates}
          />
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4 text-center">Zone List</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {zoneList.map(
          (zone) =>
            zone.TYPE !== "GATED" && (
              <div
                key={`Zone_${zone.ID}`}
                className="bg-white rounded shadow p-4 w-[360px] relative cursor-pointer"
                onClick={() => setShowAddCoordinates(zone.ID)}
              >
                <h2 className="text-lg font-bold mb-1">{zone.CODE}</h2>
                <p className="text-sm mb-2">{zone.NAME}</p>

                {Array.isArray(zone.ZONEAREAS) && zone.ZONEAREAS.length > 0 ? (
                  // Limit the number of areas displayed to 4
                  zone.ZONEAREAS.slice(0, 4).map((area, idx) => (
                    <div key={`area_${area.ID || idx}`} className="mb-2">
                      {renderMapForArea(area)}
                    </div>
                  ))
                ) : (
                  <span className="bg-[navy] text-white px-2 py-1 rounded">
                    Add Coordinates
                  </span>
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Zones;
