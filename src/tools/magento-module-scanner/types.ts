export interface ModuleInfo {
  name: string
  path: string
  version?: string
  dependencies: string[]
  hasPlugins: boolean
  hasPreferences: boolean
  hasObservers: boolean
  hasLayoutOverrides: boolean
  hasDbSchema: boolean
  phpClasses: number
}

export interface ScanResult {
  modules: ModuleInfo[]
  totalModules: number
  scanDuration: number
}
