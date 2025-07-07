export default function ({ socket, io, jwt, bcrypt, uuidv4 }) {
  socket.on("test", (data, res) => {
    console.log("Testing event received with data:", data);
    // You can perform any operations here and send a response back
    res({ status: 200, message: "Testing successful", data });
  });
  socket.on("connected", (response) => {
    console.log("Socket connected:", socket.id);
  });
}
