import { Command } from "@cliffy/command";
import { fileExists } from "../utils/deno.ts";

const install = new Command()
  .description("Start tracking your git activities.")
  .action(async () => {
    const gitDir = ".git";
    const hooksDir = `${gitDir}/hooks`;
    const hookPath = `${hooksDir}/post-commit`;
    const stateFile = "level.json";

    const hookExists = await fileExists(hookPath);
    const stateFileExists = await fileExists(stateFile);

    if (hookExists && stateFileExists) {
      console.log("Gitely is already installed.");
      return;
    }

    console.log("Installing Gitely tracking...");

    const cmd = new Deno.Command("git", {
      args: ["rev-parse", "--is-inside-work-tree"],
    });

    const result = await cmd.output();

    const isGitRepo = result.success;
    if (!isGitRepo) {
      console.error("❌ This command must be run inside a git repository.");
      Deno.exit(1);
    }

    const hookContent = `#!/usr/bin/env sh
        set -e

        # Gitely post-commit hook
        repo_root="$(git rev-parse --show-toplevel)"
        exec deno run --allow-run --allow-read --allow-write --allow-env "$repo_root/main.ts" track
        `;

    if (!hookExists) {
      await Deno.mkdir(hooksDir, { recursive: true });

      try {
        await Deno.writeTextFile(hookPath, hookContent);
        await Deno.chmod(hookPath, 0o755);
      } catch (error) {
        console.error("❌ Failed to install hook:", error);
      }
    }

    if (!stateFileExists) {
      const initialState = {
        xp: 0,
        level: 1,
      };

      try {
        await Deno.writeTextFile(stateFile, JSON.stringify(initialState));
      } catch (error) {
        console.error("❌ Failed to create state file:", error);
        Deno.exit(1);
      }
    }

    console.log("✅ Gitely tracking successfully installed.");
  });

export default install;
