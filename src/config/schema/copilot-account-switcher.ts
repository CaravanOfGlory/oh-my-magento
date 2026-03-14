import { z } from "zod"

export const CopilotAccountSwitcherConfigSchema = z.object({
  /** Enable Guided Loop Safety for Copilot sessions (default: false) */
  loop_safety_enabled: z.boolean().default(false),
  /** Enable Copilot network retry for transient TLS/network errors (default: false) */
  network_retry_enabled: z.boolean().default(false),
})

export type CopilotAccountSwitcherConfig = z.infer<typeof CopilotAccountSwitcherConfigSchema>
