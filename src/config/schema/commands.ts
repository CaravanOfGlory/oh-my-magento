import { z } from "zod"

export const BuiltinCommandNameSchema = z.enum([
  "init-deep",
  "ralph-loop",
  "ulw-loop",
  "cancel-ralph",
  "refactor",
  "start-work",
  "stop-continuation",
  "magento-upgrade",
  "magento-new-module",
  "magento-payment-setup",
  "hyva-new-theme",
  "hyva-compat-module",
])

export type BuiltinCommandName = z.infer<typeof BuiltinCommandNameSchema>
