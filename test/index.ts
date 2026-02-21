export function main(): string {
  return `Hello, world!`
}

export async function waitFor(ms: number): Promise<void> {
  return await new Promise(resolve => setTimeout(resolve, ms))
}
