import { Command } from "@cliffy/command";

const uninstall = new Command()
  .description("Stop tracking your git activities.")
  .action(async () => {
    console.log("Uninstalling Gitely tracking...");

    const gitDir = ".git";
    const hookPath = `${gitDir}/hooks/post-commit`;

    await Deno.remove(hookPath);
    // TODO: add proper error handling
    await Deno.remove("level.json");

    console.log("✅ Gitely tracking successfully uninstalled.");
  });

export default uninstall;
