import { Command } from "@cliffy/command";

const status = new Command()
  .description("Show current gitely tracking status.")
  .action(() => console.log("Gitely tracking status: active"));

export default status;
