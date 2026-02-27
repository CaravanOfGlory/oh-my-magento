export type TrackerProvider = "linear" | "jira"

export interface TrackerSyncResult {
  provider: TrackerProvider
  success: boolean
  message: string
}
