import { Command } from "@cliffy/command";
import { fileExists } from "../utils/deno.ts";
import { dirname } from "https://deno.land/std/path/mod.ts";
import { APP_NAME, HOOK_PATH, HOOKS_DIR, STATE_FILE_PATH } from "../config.ts";

const install = new Command()
  .description("Start tracking your git activities.")
  .action(async () => {
    const hookExists = await fileExists(HOOK_PATH);
    const stateFileExists = await fileExists(STATE_FILE_PATH);

    if (hookExists && stateFileExists) {
      console.log(`${APP_NAME} is already installed.`);
      return;
    }

    console.log(`Installing ${APP_NAME} tracking...`);

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

        # ${APP_NAME} post-commit hook
        "$(which ${APP_NAME})" track
        `;

    if (!hookExists) {
      await Deno.mkdir(HOOKS_DIR, { recursive: true });

      try {
        await Deno.writeTextFile(HOOK_PATH, hookContent);

        if (Deno.build.os !== "windows") {
          await Deno.chmod(HOOK_PATH, 0o755);
        }
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
        await Deno.mkdir(dirname(STATE_FILE_PATH), {
          recursive: true,
        });
        await Deno.writeTextFile(STATE_FILE_PATH, JSON.stringify(initialState));
      } catch (error) {
        console.error("❌ Failed to create state file:", error);
        Deno.exit(1);
      }
    }

    console.log(`✅ ${APP_NAME} tracking successfully installed.`);
  });

export default install;
