import React from 'react';
import { Polygon, Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

export const JalanElizabethDuaPolygon = ({ onParkingPress }) => {
  const center1 = { latitude: 4.890244, longitude: 114.941518 };
  const center2 = { latitude: 4.8902460, longitude: 114.939601 };

  const coords1 = [
    { latitude: center1.latitude + 0.00020, longitude: center1.longitude - 0.0006 },
    { latitude: center1.latitude + 0.00020, longitude: center1.longitude + 0.0006 },
    { latitude: center1.latitude - 0.00002, longitude: center1.longitude + 0.0006 },
    { latitude: center1.latitude - 0.00002, longitude: center1.longitude - 0.0006 },
  ];

    const coords2 = [
    { latitude: center2.latitude + 0.00015, longitude: center2.longitude - 0.0003 },
    { latitude: center2.latitude + 0.00015, longitude: center2.longitude + 0.0003 },
    { latitude: center2.latitude - 0.00002, longitude: center2.longitude + 0.0003 },
    { latitude: center2.latitude - 0.00002, longitude: center2.longitude - 0.0003 },
  ];

  return (
    <>
      <Polygon
        coordinates={coords1}
        strokeColor="#000000"
        fillColor="rgba(0, 110, 255, 0.68)"
        strokeWidth={1}
        tappable
      />
      <Marker coordinate={center1} onPress={() => onParkingPress('Jalan Elizabet Dua')}>
        <MaterialIcons name="local-parking" size={30} color="#fff" style={{ backgroundColor: '#0B477B', borderRadius: 15, padding: 2 }} />
      </Marker>

      <Polygon
        coordinates={coords2}
        strokeColor="#000000"
        fillColor="rgba(0, 110, 255, 0.68)"
        strokeWidth={1}
        tappable
      />
      <Marker coordinate={center2} onPress={() => onParkingPress('Jalan Elizabet Dua')}>
        <MaterialIcons name="local-parking" size={30} color="#fff" style={{ backgroundColor: '#0B477B', borderRadius: 15, padding: 2 }} />
      </Marker>
    </>
  );
};
