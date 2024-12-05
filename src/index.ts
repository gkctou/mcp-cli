#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const transport = new StdioServerTransport();

  const allowedPaths = process.argv.slice(2);
  if (allowedPaths.length === 0) {
    console.error("Error: At least one allowed path must be provided");
    process.exit(1);
  }

  const { server } = createServer(allowedPaths);
  // console.log("MCP Shell server started");
  // console.log("Allowed paths:", allowedPaths);

  await server.connect(transport);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    // await cleanup();
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
