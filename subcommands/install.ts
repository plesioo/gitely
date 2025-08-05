import { Command } from "@cliffy/command";

const install = new Command()
  .description("Start tracking your git activities.")
  .action(async () => {
    const hookPath = ".git/hooks/post-commit";

    const hookContent = `#!/bin/sh
    # Gitely post-commit hook
    deno run --allow-read --allow-write --allow-env /Users/phillipfleischer/Documents/gitely/main.ts track
    `;

    try {
      await Deno.writeTextFile(hookPath, hookContent);
      await Deno.chmod(hookPath, 0o755);
    } catch (error) {
      console.error("❌ Failed to install hook:", error);
    }

    console.log("✅ Gitely tracking successfully installed.");
  });

export default install;
