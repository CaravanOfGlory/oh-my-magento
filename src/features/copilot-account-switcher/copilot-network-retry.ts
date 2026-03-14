import { log } from "../../shared"

import type { FetchLike } from "./types"

const RETRYABLE_MESSAGES = [
  "load failed",
  "failed to fetch",
  "network request failed",
  "sse read timed out",
  "unable to connect",
  "econnreset",
  "etimedout",
  "socket hang up",
  "unknown certificate",
  "self signed certificate",
  "unable to verify the first certificate",
  "self-signed certificate in certificate chain",
]

type RetryableSystemError = Error & {
  code: string
  syscall: string
  cause: unknown
}

type JsonRecord = Record<string, unknown>

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError"
}

function getErrorMessage(error: unknown): string {
  return String(error instanceof Error ? error.message : error).toLowerCase()
}

function isInputIdTooLongErrorBody(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false
  const error = (payload as { error?: { message?: unknown } }).error
  const message = String(error?.message ?? "").toLowerCase()
  return message.includes("invalid 'input[") && message.includes(".id'") && message.includes("string too long")
}

function isInputIdTooLongMessage(text: string): boolean {
  const message = text.toLowerCase()
  return message.includes("invalid 'input[") && message.includes(".id'") && message.includes("string too long")
}

function hasLongInputIds(payload: JsonRecord): boolean {
  const input = payload.input
  if (!Array.isArray(input)) return false
  return input.some(
    (item) => typeof (item as { id?: unknown })?.id === "string" && ((item as { id?: string }).id?.length ?? 0) > 64,
  )
}

function stripLongInputIds(payload: JsonRecord): JsonRecord {
  const input = payload.input
  if (!Array.isArray(input)) return payload

  let changed = false
  const nextInput = input.map((item) => {
    if (!item || typeof item !== "object") return item
    const id = (item as { id?: unknown }).id
    if (typeof id === "string" && id.length > 64) {
      changed = true
      const clone = { ...(item as JsonRecord) }
      delete (clone as { id?: unknown }).id
      return clone
    }
    return item
  })

  if (!changed) return payload
  return { ...payload, input: nextInput }
}

function parseJsonBody(init?: RequestInit): JsonRecord | undefined {
  if (typeof init?.body !== "string") return undefined
  try {
    const parsed = JSON.parse(init.body)
    if (!parsed || typeof parsed !== "object") return undefined
    return parsed as JsonRecord
  } catch {
    return undefined
  }
}

function buildRetryInit(init: RequestInit | undefined, payload: JsonRecord): RequestInit {
  const headers = new Headers(init?.headers)
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }
  return { ...init, headers, body: JSON.stringify(payload) }
}

async function maybeRetryInputIdTooLong(
  request: Request | URL | string,
  init: RequestInit | undefined,
  response: Response,
  baseFetch: FetchLike,
): Promise<Response> {
  if (response.status !== 400) return response

  const requestPayload = parseJsonBody(init)
  if (!requestPayload || !hasLongInputIds(requestPayload)) return response

  const responseText = await response
    .clone()
    .text()
    .catch(() => "")

  if (!responseText) return response

  let matched = isInputIdTooLongMessage(responseText)
  if (!matched) {
    try {
      const bodyPayload = JSON.parse(responseText)
      matched = isInputIdTooLongErrorBody(bodyPayload)
    } catch {
      matched = false
    }
  }

  if (!matched) return response

  const sanitized = stripLongInputIds(requestPayload)
  if (sanitized === requestPayload) return response

  log("[copilot-network-retry] input-id retry triggered", {
    removedLongIds: true,
    hadPreviousResponseId: typeof requestPayload.previous_response_id === "string",
  })

  return baseFetch(request, buildRetryInit(init, sanitized))
}

function toRetryableSystemError(error: unknown): RetryableSystemError {
  const base = error instanceof Error ? error : new Error(String(error))
  const wrapped = new Error(`[copilot-network-retry normalized] ${base.message}`) as RetryableSystemError
  wrapped.name = base.name
  wrapped.code = "ECONNRESET"
  wrapped.syscall = "fetch"
  wrapped.cause = error
  return wrapped
}

function isCopilotUrl(request: Request | URL | string): boolean {
  const raw = request instanceof Request ? request.url : request instanceof URL ? request.href : String(request)

  try {
    const url = new URL(raw)
    return url.hostname === "api.githubcopilot.com" || url.hostname.startsWith("copilot-api.")
  } catch {
    return false
  }
}

export function isRetryableCopilotFetchError(error: unknown): boolean {
  if (!error || isAbortError(error)) return false
  const message = getErrorMessage(error)
  return RETRYABLE_MESSAGES.some((part) => message.includes(part))
}

export function createCopilotRetryingFetch(baseFetch: FetchLike): FetchLike {
  return async function retryingFetch(request: Request | URL | string, init?: RequestInit): Promise<Response> {
    try {
      const response = await baseFetch(request, init)

      if (isCopilotUrl(request)) {
        return maybeRetryInputIdTooLong(request, init, response, baseFetch)
      }
      return response
    } catch (error) {
      if (!isCopilotUrl(request) || !isRetryableCopilotFetchError(error)) {
        throw error
      }

      log("[copilot-network-retry] normalizing retryable error", {
        message: getErrorMessage(error),
      })

      throw toRetryableSystemError(error)
    }
  }
}
