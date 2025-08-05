import install from "./subcommands/install.ts";
import uninstall from "./subcommands/uninstall.ts";
import status from "./subcommands/status.ts";

import { Command } from "@cliffy/command";

new Command()
  .name("gitely")
  .version("1.0.0")
  .description("A CLI tool for tracking git activities.")
  .command("install", install)
  .command("uninstall", uninstall)
  .command("status", status)
  .parse(Deno.args);