import { Command } from "@cliffy/command";

const install = new Command()
  .description("Start tracking your git activities.")
  .action(() => console.log("Gitely started tracking"));

export default install;