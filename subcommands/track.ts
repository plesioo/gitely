import { Command } from "@cliffy/command";

const track = new Command().action(async () => {
  const MIN_XP = 20;
  const MAX_XP = 50;

  const sessionXp = getRandomIntRoundedDownToNearest5(MIN_XP, MAX_XP);

  const isXpFileExisting = await Deno.stat("level.json").then(
    () => true,
    () => false,
  );
  if (!isXpFileExisting) {
    await Deno.writeTextFile("level.json", JSON.stringify({ xp: 0, level: 1 }));
  }

  const { xp: currentXp, level: currentLevel } = JSON.parse(
    await Deno.readTextFile("level.json"),
  );

  let level = currentLevel;
  let totalXp = sessionXp + currentXp;

  const requiredXp = getRequiredXpForLevelup(currentLevel);

  const isLevelUp = totalXp >= requiredXp;
  if (isLevelUp) {
    level++;
    totalXp -= requiredXp;
    console.log(`🎉 Level up! You are now at level ${level}.`);
  }

  await Deno.writeTextFile(
    "level.json",
    JSON.stringify({
      xp: totalXp,
      level,
    }),
  );

  console.log(`You earned ${sessionXp} XP!`);
});

function getRandomIntRoundedDownToNearest5(min: number, max: number): number {
  const num = Math.floor(Math.random() * (max - min + 1) + min);
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

track.hidden();

export default track;
