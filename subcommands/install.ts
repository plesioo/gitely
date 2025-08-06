import { Command } from "@cliffy/command";

const install = new Command()
  .description("Start tracking your git activities.")
  .action(async () => {
    console.log("Installing Gitely tracking...");
    const gitDir = ".git";

    const cmd = new Deno.Command("git", {
      args: ["rev-parse", "--is-inside-work-tree"],
    });
    const result = await cmd.output();
    const isGitRepo = result.success;

    if (!isGitRepo) {
      console.error("❌ This command must be run inside a git repository.");
      Deno.exit(1);
    }

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
