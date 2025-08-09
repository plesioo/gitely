import { Command } from "@cliffy/command";
import { STATE_FILE_PATH } from "../config.ts";

interface State {
  xp: number;
  level: number;
  lastCommit?: string;
}

const track = new Command().action(async () => {
  const state: State = await getState(STATE_FILE_PATH);
  const currentHash = await getCurrentHash();

  if (state.lastCommit) {
    const isAncestor = await IsCommitAncestor(state.lastCommit, currentHash);
    if (!isAncestor) {
      await handleGitReset(state, currentHash, STATE_FILE_PATH);
      return;
    }
  }

  const { newLevel, newXp, sessionXp } = awardXp(state);

  const newState = {
    xp: newXp,
    level: newLevel,
    lastCommit: currentHash,
  };
  await updateState(STATE_FILE_PATH, newState);

  console.log(
    `You earned ${sessionXp} XP! Total XP: ${newXp}, Level: ${newLevel}`,
  );
});

async function getState(stateFilePath: string): Promise<State> {
  try {
    return JSON.parse(await Deno.readTextFile(stateFilePath));
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return { xp: 0, level: 1 };
    } else {
      console.error("Failed to read state file:", err);
      Deno.exit(1);
    }
  }
}

async function getCurrentHash(): Promise<string> {
  const headProc = new Deno.Command("git", {
    args: ["rev-parse", "HEAD"],
  });

  const { stdout: headOut, code: headCode, stderr: headErr } = await headProc
    .output();
  if (headCode !== 0) {
    console.error(
      "Failed to get current commit hash:",
      new TextDecoder().decode(headErr),
    );
    Deno.exit(1);
  }

  return new TextDecoder().decode(headOut).trim();
}

async function IsCommitAncestor(
  lastCommit: string,
  currentHash: string,
): Promise<boolean> {
  const ancResult = await new Deno.Command("git", {
    args: ["merge-base", "--is-ancestor", lastCommit, currentHash],
    stdout: "null",
    stderr: "null",
  }).output();
  return ancResult.code === 0;
}

async function handleGitReset(
  state: State,
  currentHash: string,
  stateFile: string,
): Promise<void> {
  state.lastCommit = currentHash;
  await Deno.writeTextFile(stateFile, JSON.stringify(state));
  console.log("🔄 Last commit was reset. No XP awarded.");
}

function awardXp(
  state: State,
): { newLevel: number; newXp: number; sessionXp: number } {
  const MIN_XP = 20;
  const MAX_XP = 50;

  const sessionXp = getRandomIntRoundedDownToNearest5(MIN_XP, MAX_XP);

  const { xp: currentXp, level: currentLevel } = state;

  let newLevel = currentLevel;
  let newXp = sessionXp + currentXp;

  const requiredXp = getRequiredXpForLevelup(currentLevel);
  if (newXp >= requiredXp) {
    newLevel++;
    newXp -= requiredXp;
    console.log(`🎉 Level up! You are now at level ${newLevel}.`);
  }

  return { newLevel, newXp, sessionXp };
}

function getRandomIntRoundedDownToNearest5(min: number, max: number): number {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return roundDownToNearest5(num);
}

function getRequiredXpForLevelup(level: number): number {
  const num = Math.floor(45 * Math.pow(level, 1.01));
  return roundDownToNearest5(num);
}

function roundDownToNearest5(num: number): number {
  const rest = num % 5;
  return num - rest;
}

async function updateState(
  stateFile: string,
  state: State,
): Promise<void> {
  try {
    await Deno.writeTextFile(
      stateFile,
      JSON.stringify(state),
    );
  } catch (writeErr) {
    console.error("Failed to write state file:", writeErr);
    Deno.exit(1);
  }
}

track.hidden();

export default track;
