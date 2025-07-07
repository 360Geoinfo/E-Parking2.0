import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Polygon,
  Marker,
  Popup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useSocket } from "../../context/socket";

const ZoneCoordinates = ({ zoneId, setShowAddCoordinates }) => {
  const { zoneList, socket } = useSocket();
  const [zoneData, setZoneData] = useState({});
  const [zoneAreas, setZoneAreas] = useState([]);
  const [deletedAreaIds, setDeletedAreaIds] = useState([]);
  const featureGroupRefs = useRef([]);

  useEffect(() => {
    if (zoneList.length > 0) {
      const zone = zoneList.find((z) => z.ID === zoneId);
      setZoneData(zone || {});
      if (zone && Array.isArray(zone.ZONEAREAS)) {
        setZoneAreas(
          zone.ZONEAREAS.map((area) => ({
            id: area.ID,
            areaName: area.AREA_NAME || `Area ${area.ID}`,
            center: JSON.parse(area.CENTER),
            angle: parseFloat(area.ANGLE || 0),
            vectors: area.VECTORS || [],
          }))
        );
      } else {
        setZoneAreas([
          {
            areaName: "Area 1",
            center: { latitude: 4.887051, longitude: 114.942906 },
            angle: 0,
            vectors: [
              { latitude: 4.887251, longitude: 114.942006 },
              { latitude: 4.887251, longitude: 114.943006 },
              { latitude: 4.887031, longitude: 114.943006 },
              { latitude: 4.887031, longitude: 114.942006 },
            ],
          },
        ]);
      }
      setDeletedAreaIds([]); // Reset deleted areas when zone changes
    }
  }, [zoneId, zoneList]);

  const rotatePoints = (points, center, angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    return points.map(({ latitude, longitude }) => {
      const dx = latitude - center.latitude;
      const dy = longitude - center.longitude;
      return {
        latitude: center.latitude + dx * cosA - dy * sinA,
        longitude: center.longitude + dx * sinA + dy * cosA,
      };
    });
  };

  const handleSaveZoneArea = () => {
    const payload = {
      updatedAreas: zoneAreas.map((area) => ({
        zoneId,
        areaId: area.id || null,
        areaName: area.areaName || null,
        center: area.center,
        angle: area.angle,
        vectors: area.vectors,
      })),
      deletedAreaIds,
    };

    socket.emit("saveZoneAreas", payload, (response) => {
      if (response.status === 200) {
        alert("Zone areas saved successfully!");
        setShowAddCoordinates(false);
        setDeletedAreaIds([]); // clear deleted IDs after save
      } else {
        alert(`Failed to save zone areas: ${response.message}`);
      }
    });
  };

  const addNewArea = () => {
    setZoneAreas([
      ...zoneAreas,
      {
        areaName: `Area ${zoneAreas.length + 1}`,
        center: { latitude: 4.887051, longitude: 114.942906 },
        angle: 0,
        vectors: [
          { latitude: 4.887251, longitude: 114.942006 },
          { latitude: 4.887251, longitude: 114.943006 },
          { latitude: 4.887031, longitude: 114.943006 },
          { latitude: 4.887031, longitude: 114.942006 },
        ],
      },
    ]);
  };

  const onPolygonChange = (index, vectors, center) => {
    const updatedAreas = [...zoneAreas];
    updatedAreas[index].vectors = vectors;
    updatedAreas[index].center = center;
    updatedAreas[index].angle = 0;
    setZoneAreas(updatedAreas);
  };

  // Remove an area by index and track deleted IDs if needed
  const removeArea = (removeIndex) => {
    const areaToRemove = zoneAreas[removeIndex];
    if (areaToRemove.id) {
      setDeletedAreaIds((prev) => [...prev, areaToRemove.id]);
    }
    setZoneAreas((prev) => prev.filter((_, i) => i !== removeIndex));
  };

  // Update a specific vector point of an area
  const onVectorChange = (areaIndex, vectorIndex, key, value) => {
    const updatedAreas = [...zoneAreas];
    const vector = { ...updatedAreas[areaIndex].vectors[vectorIndex] };
    vector[key] = parseFloat(value);
    updatedAreas[areaIndex].vectors[vectorIndex] = vector;
    setZoneAreas(updatedAreas);
  };

  return (
    <div className="bg-white p-4 rounded shadow-lg max-w-6xl mx-auto">
      <h2 className="text-lg font-bold mb-4">Zone Coordinates Editor</h2>

      <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
        {zoneAreas.map((area, index) => {
          const rotatedVectors = rotatePoints(
            area.vectors,
            area.center,
            area.angle
          );

          return (
            <div
              key={index}
              className="flex flex-row gap-6 mb-6 border p-4 rounded shadow-sm relative"
              style={{ minHeight: 400 }}
            >
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeArea(index)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold text-xl"
                title="Remove this area"
              >
                &times;
              </button>

              {/* Map on left */}
              <div
                className="border rounded overflow-hidden flex-shrink-0"
                style={{ height: 400, width: 400 }}
              >
                <MapContainer
                  center={[area.center.latitude, area.center.longitude]}
                  zoom={18}
                  style={{ height: "100%", width: "100%" }}
                  key={`${index}-${area.center.latitude}-${area.center.longitude}`}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <FeatureGroup
                    ref={(el) => (featureGroupRefs.current[index] = el)}
                  >
                    <EditControl
                      position="topright"
                      onCreated={(e) => {
                        const latlngs = e.layer.getLatLngs()[0];
                        const newVectors = latlngs.map((latlng) => ({
                          latitude: latlng.lat,
                          longitude: latlng.lng,
                        }));
                        const latSum = newVectors.reduce(
                          (sum, p) => sum + p.latitude,
                          0
                        );
                        const lngSum = newVectors.reduce(
                          (sum, p) => sum + p.longitude,
                          0
                        );
                        const newCenter = {
                          latitude: latSum / newVectors.length,
                          longitude: lngSum / newVectors.length,
                        };
                        onPolygonChange(index, newVectors, newCenter);
                      }}
                      onEdited={(e) => {
                        e.layers.eachLayer((layer) => {
                          if (layer instanceof L.Polygon) {
                            const latlngs = layer.getLatLngs()[0];
                            const newVectors = latlngs.map((latlng) => ({
                              latitude: latlng.lat,
                              longitude: latlng.lng,
                            }));
                            const latSum = newVectors.reduce(
                              (sum, p) => sum + p.latitude,
                              0
                            );
                            const lngSum = newVectors.reduce(
                              (sum, p) => sum + p.longitude,
                              0
                            );
                            const newCenter = {
                              latitude: latSum / newVectors.length,
                              longitude: lngSum / newVectors.length,
                            };
                            onPolygonChange(index, newVectors, newCenter);
                          }
                        });
                      }}
                      draw={{
                        rectangle: false,
                        circle: false,
                        polyline: false,
                        marker: false,
                        circlemarker: false,
                        polygon: {
                          allowIntersection: false,
                          shapeOptions: { color: "blue" },
                        },
                      }}
                      edit={{ remove: true }}
                    />
                    {rotatedVectors.length > 0 && (
                      <Polygon
                        positions={rotatedVectors.map((v) => [
                          v.latitude,
                          v.longitude,
                        ])}
                        pathOptions={{ color: "blue", fillOpacity: 0.4 }}
                      />
                    )}
                    <Marker
                      position={[area.center.latitude, area.center.longitude]}
                    >
                      <Popup>
                        Center: [{area.center.latitude.toFixed(6)},{" "}
                        {area.center.longitude.toFixed(6)}]
                      </Popup>
                    </Marker>
                  </FeatureGroup>
                </MapContainer>
              </div>

              {/* Form on right */}
              <div className="flex flex-col gap-4 flex-1 max-w-md overflow-auto">
                <div>
                  <label className="block font-semibold mb-1">Area Name</label>
                  <input
                    type="text"
                    value={area.areaName}
                    onChange={(e) => {
                      const updated = [...zoneAreas];
                      updated[index].areaName = e.target.value;
                      setZoneAreas(updated);
                    }}
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-semibold mb-1">
                      Center Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={area.center.latitude}
                      onChange={(e) => {
                        const newCenter = {
                          ...area.center,
                          latitude: parseFloat(e.target.value),
                        };
                        onPolygonChange(index, area.vectors, newCenter);
                      }}
                      className="w-full border border-gray-300 p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">
                      Center Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={area.center.longitude}
                      onChange={(e) => {
                        const newCenter = {
                          ...area.center,
                          longitude: parseFloat(e.target.value),
                        };
                        onPolygonChange(index, area.vectors, newCenter);
                      }}
                      className="w-full border border-gray-300 p-2 rounded"
                    />
                  </div>
                </div>

                {/* Vectors inputs */}
                <div>
                  <label className="block font-semibold mb-2">
                    Vectors (Polygon Points)
                  </label>
                  {area.vectors.map((vector, vIndex) => (
                    <div key={vIndex} className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <label className="block text-xs mb-1">Latitude</label>
                        <input
                          type="number"
                          step="0.0000001"
                          value={vector.latitude}
                          onChange={(e) =>
                            onVectorChange(
                              index,
                              vIndex,
                              "latitude",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 p-1 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Longitude</label>
                        <input
                          type="number"
                          step="0.0000001"
                          value={vector.longitude}
                          onChange={(e) =>
                            onVectorChange(
                              index,
                              vIndex,
                              "longitude",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 p-1 rounded text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={addNewArea}
        >
          Add Area
        </button>
        <div className="flex gap-2">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            onClick={() => setShowAddCoordinates(false)}
          >
            Close
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={handleSaveZoneArea}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZoneCoordinates;
