export interface FetchServerData {
  canNextUpdate: Date
  canUpdate: boolean
  lastUpdate: Date
  rows: object[]
}

export interface MainProps {
  isLocalServer: boolean
  changeLocal: (event: React.ChangeEvent<HTMLInputElement>) => void
}
