export async function runGitCommand(args: string[]): Promise<string> {
  const { stdout } = await new Deno.Command("git", {
    args: args,
  }).output();

  return new TextDecoder().decode(stdout).trim();
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(path);
    return stat.isFile;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw error;
    }
  }
}
