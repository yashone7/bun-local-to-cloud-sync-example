import net from "net";
import path from "path";

const pipeName = path.join("\\\\.\\pipe", "myNamedPipe");

const server = net.createServer((stream) => {
  console.log("Client connected.");

  stream.on("data", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`Received message: ${message.text}`);
      console.log(`Timestamp: ${message.timestamp}`);

      // Echo back to demonstrate bidirectional communication
      stream.write(`Server received: ${message.text}`);
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  stream.on("end", () => {
    console.log("Client disconnected.");
  });
});

server.listen(pipeName, () => {
  console.log(`Server listening on ${pipeName}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});
