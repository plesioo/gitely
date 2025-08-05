import { Command } from "@cliffy/command";

// Hide the command by not exporting it, or set a private flag if using a command registry.
// Option 1: Do not export
const track = new Command()
  .action(() => console.log("Track begins..."));

track.hidden();

export default track;
