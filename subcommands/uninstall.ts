import { Command } from "@cliffy/command";

const uninstall = new Command()
  .description("Stop tracking your git activities.")
  .action(async () => {
    console.log("Uninstalling Gitely tracking...");

    const gitDir = ".git";
    const hookPath = `${gitDir}/hooks/post-commit`;

    try {
      await Deno.remove(hookPath);
      await Deno.remove("level.json");
      console.log("✅ Gitely tracking successfully uninstalled.");
    } catch (error) {
      console.error("❌ Failed to uninstall Gitely tracking:", error);
    }
  });

export default uninstall;
