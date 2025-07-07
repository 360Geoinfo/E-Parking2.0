import React from 'react';
import { Polygon, Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

export const JalanMcArthurPolygon = ({ onParkingPress }) => {
  const center1 = { latitude: 4.887051, longitude: 114.942906 };
  const coords1 = [
    { latitude: center1.latitude + 0.00020, longitude: center1.longitude - 0.0009 },
    { latitude: center1.latitude + 0.00020, longitude: center1.longitude + 0.0010 },
    { latitude: center1.latitude - 0.00002, longitude: center1.longitude + 0.0010 },
    { latitude: center1.latitude - 0.00002, longitude: center1.longitude - 0.0009 },
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
      <Marker coordinate={center1} onPress={() => onParkingPress('Jalan McArthur')}>
        <MaterialIcons name="local-parking" size={30} color="#fff" style={{ backgroundColor: '#0B477B', borderRadius: 15, padding: 2 }} />
      </Marker>
    </>
  );
};
