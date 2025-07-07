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

export const JalanCatorPolygon = ({ onParkingPress }) => {
  const center1 = { latitude: 4.888051, longitude: 114.943605 };

  const rawCoords2 = [
    { latitude: center1.latitude + 0.00020, longitude: center1.longitude - 0.0006 },
    { latitude: center1.latitude + 0.00020, longitude: center1.longitude + 0.0006 },
    { latitude: center1.latitude - 0.00002, longitude: center1.longitude + 0.0006 },
    { latitude: center1.latitude - 0.00002, longitude: center1.longitude - 0.0006 },
  ];

   const coords1 = rawCoords2.map((coord) =>
    rotateCoordinate(coord, center1, -10)
  );
   

  return (
    <>
      <Polygon
        coordinates={coords1}
        strokeColor="#000000"
        fillColor="rgba(0, 110, 255, 0.68)"
        strokeWidth={1}
        tappable
      />
      <Marker coordinate={center1} onPress={() => onParkingPress('Jalan Cator')}>
        <MaterialIcons name="local-parking" size={30} color="#fff" style={{ backgroundColor: '#0B477B', borderRadius: 15, padding: 2 }} />
      </Marker>
    </>
  );
};
