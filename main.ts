import install from "./subcommands/install.ts";
import uninstall from "./subcommands/uninstall.ts";
import track from "./subcommands/track.ts";
import status from "./subcommands/stats.ts";

import { Command } from "@cliffy/command";
import { APP_NAME } from "./config.ts";

new Command()
  .name(APP_NAME)
  .version("0.0.1-alpha")
  .description("A CLI tool for tracking git activities.")
  .command("install", install)
  .command("uninstall", uninstall)
  .command("track", track)
  .command("status", status)
  .action(function () {
    this.showHelp();
  })
  .parse(Deno.args);
