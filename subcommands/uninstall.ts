import { Command } from "@cliffy/command";
import { APP_NAME, HOOK_PATH, STATE_FILE_PATH } from "../config.ts";

const uninstall = new Command()
  .description("Stop tracking your git activities.")
  .action(async () => {
    console.log(`Uninstalling ${APP_NAME} tracking...`);

    try {
      await Deno.remove(HOOK_PATH);
      await Deno.remove(STATE_FILE_PATH);
      console.log(`✅ ${APP_NAME} tracking successfully uninstalled.`);
    } catch (error) {
      console.error(`❌ Failed to uninstall ${APP_NAME} tracking:`, error);
    }
  });

export default uninstall;
