import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function runCommand(
  command: string,
  args: string[],
  options: { timeout?: number; maxBuffer?: number } = {}
): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync(command, args, {
    shell: false,
    timeout: options.timeout ?? 120_000,
    maxBuffer: options.maxBuffer ?? 10 * 1024 * 1024,
    windowsHide: true,
  });
}
