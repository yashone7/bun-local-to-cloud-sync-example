import { Hono } from "hono";
import { readS3File } from ".";

const app = new Hono();

const PORT = import.meta.env.PORT;

app.get("/", (ctx) => ctx.text("hello bun!"));

app.get("/get_content", async (ctx) => {
  const string = await readS3File("test-bucket", "story.txt");
  if (string !== null) {
    // return ctx.text(string);
    return ctx.text(string);
  } else return ctx.text("no contents in file");
});

console.log(`App running on port ${PORT}`);

export default {
  fetch: app.fetch,
  port: PORT || 3001,
};
