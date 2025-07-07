import React from "react";
import { TextInput } from "react-native";

const Searchbar = ({ query, setQuery }) => {
  const handleInputChange = (text) => {
    setQuery(text);
  };
  return (
    <>
      <TextInput
        style={{
          flexGrow: 1,
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: "#fff",
          borderRadius: 10,
          borderColor: "#bbb",
          borderWidth: 1,
          fontSize: 20,
          height: 50,
        }}
        placeholder="Search Plate License"
        placeholderTextColor="#888"
        onChangeText={handleInputChange}
        value={query}
      />
    </>
  );
};

export default Searchbar;
