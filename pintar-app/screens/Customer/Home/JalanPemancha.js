import React from 'react';
import { Polygon, Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

// Utility: Rotate coordinate around a center by given angle
const rotateCoordinate = (point, center, angle) => {
  const rad = (Math.PI / 180) * angle;
  const lat = point.latitude - center.latitude;
  const lon = point.longitude - center.longitude;
  const rotatedLat = lat * Math.cos(rad) - lon * Math.sin(rad);
  const rotatedLon = lat * Math.sin(rad) + lon * Math.cos(rad);
  return {
    latitude: rotatedLat + center.latitude,
    longitude: rotatedLon + center.longitude,
  };
};

export const JalanPemanchaPolygon = ({ onParkingPress }) => {
  const center2 = { latitude: 4.888892, longitude: 114.943447 };
  const rawCoords2 = [
  { latitude: center2.latitude + 0.00010, longitude: center2.longitude - 0.0010 }, // First point
  { latitude: center2.latitude + 0.00010, longitude: center2.longitude + 0.0006 },  // Second point
  { latitude: center2.latitude - 0.00002, longitude: center2.longitude + 0.0006 },  // Third point
  { latitude: center2.latitude - 0.00002, longitude: center2.longitude - 0.0010 },  // Fourth point
];

// Coordinates for the new polygon (for the second location)
  const centerNew = { latitude: 4.888746, longitude: 114.941568 };

  // Define the raw coordinates for the new polygon (similarly to the first one)
  const rawCoordsNew = [
    { latitude: centerNew.latitude + 0.00010, longitude: centerNew.longitude - 0.0006 }, // First point
    { latitude: centerNew.latitude + 0.00010, longitude: centerNew.longitude + 0.0009 },  // Second point
    { latitude: centerNew.latitude - 0.00002, longitude: centerNew.longitude + 0.0009 },  // Third point
    { latitude: centerNew.latitude - 0.00002, longitude: centerNew.longitude - 0.0006 },  // Fourth point
  ];

  const coords2 = rawCoords2.map((coord) =>
    rotateCoordinate(coord, center2, -10)
  );


// Rotate the coordinates if necessary (you can modify the angle or remove if no rotation is needed)
  const coordsNew = rawCoordsNew.map((coord) =>
    rotateCoordinate(coord, centerNew, -1)
  );



  return (
    <>
      <Polygon
        coordinates={coords2}
        strokeColor="#000000"
        fillColor="rgba(0, 110, 255, 0.68)"
        strokeWidth={1}
        tappable
      />
      <Marker coordinate={center2} onPress={() => onParkingPress('Jalan Pemancha')}>
        <MaterialIcons name="local-parking" size={30} color="#fff" style={{ backgroundColor: '#0B477B', borderRadius: 15, padding: 2 }} />
      </Marker>

      {/* New polygon for the second location */}
      <Polygon
        coordinates={coordsNew}
         strokeColor="#000000"
        fillColor="rgba(0, 110, 255, 0.68)"
        strokeWidth={1}
        tappable
      />
     <Marker coordinate={centerNew} onPress={() => onParkingPress('Jalan Pemancha')}>
        <MaterialIcons name="local-parking" size={30} color="#fff" style={{ backgroundColor: '#0B477B', borderRadius: 15, padding: 2 }} />
      </Marker>
    </>
  );
};
