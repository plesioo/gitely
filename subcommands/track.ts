import { Command } from "@cliffy/command";

const track = new Command().action(async () => {
  const sessionXp = getRandomInt(20, 50);

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

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRequiredXpForLevelup(level: number): number {
  return Math.floor(45 * Math.pow(level, 1.01));
}

track.hidden();

export default track;
