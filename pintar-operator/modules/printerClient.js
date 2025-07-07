// printerClient.js
import net from "net";

class PrinterClient {
  constructor(ip, port = 9100) {
    this.ip = ip;
    this.port = port;
  }

  send(data) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();

      client.connect(this.port, this.ip, () => {
        if (typeof data === "string") {
          client.write(Buffer.from(data, "utf8"));
        } else {
          client.write(data);
        }
        client.end();
      });

      client.on("close", () => resolve("Print job sent"));
      client.on("error", (err) => reject(err));
    });
  }
}

export default PrinterClient;
