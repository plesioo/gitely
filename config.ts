export const APP_NAME = "gitely";
export const PROGRESS_FILE = "progress.json";

export const HOOKS_DIR = ".git/hooks";
export const HOOK_PATH = `${HOOKS_DIR}/post-commit`;
export const STATE_FILE_PATH = `${getDataDir()}/${PROGRESS_FILE}`;

function getDataDir(): string {
  const home = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE") ?? ".";
  const os = Deno.build.os;

  if (os === "linux") {
    const xdgData = Deno.env.get("XDG_DATA_HOME") ?? `${home}/.local/share`;
    return `${xdgData}/${APP_NAME}`;
  }
  if (os === "darwin") {
    return `${home}/Library/Application Support/${APP_NAME}`;
  }
  if (os === "windows") {
    const appData = Deno.env.get("APPDATA") ?? `${home}\\AppData\\Roaming`;
    return `${appData}\\${APP_NAME}`;
  }
  throw new Error(`Unsupported OS: ${os}`);
}
