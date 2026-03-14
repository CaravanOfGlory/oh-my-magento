import { readStoreSafe, LOOP_SAFETY_POLICY } from "../features/copilot-account-switcher"

export function createSystemTransformHandler(): (
  input: { sessionID: string },
  output: { system: string[] },
) => Promise<void> {
  return async (_input, output): Promise<void> => {
    const store = await readStoreSafe().catch(() => undefined)
    if (store?.loopSafetyEnabled !== true) return
    if (output.system.includes(LOOP_SAFETY_POLICY)) return
    output.system.push(LOOP_SAFETY_POLICY)
  }
}
