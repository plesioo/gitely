import { Command } from "@cliffy/command";

const uninstall = new Command()
  .description("Stop tracking your git activities.")
  .action(() => console.log("Gitely stopped tracking"));

export default uninstall;