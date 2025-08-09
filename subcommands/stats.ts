import { Command } from "@cliffy/command";
import { STATE_FILE_PATH } from "../config.ts";

const stats = new Command()
  .description("Show your current gitely stats.")
  .action(async () => {
    try {
      const stats = JSON.parse(await Deno.readTextFile(STATE_FILE_PATH));
      console.log(`
        Your current gitely stats:
        XP: ${stats.xp}
        Level: ${stats.level}
    `);
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        console.error(
          "Stats not found. Make sure you run `gitely track` first",
        );
      } else {
        console.error("Failed to read stats file:", err);
        Deno.exit(1);
      }
    }
  });

export default stats;
