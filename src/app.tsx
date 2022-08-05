import { ThemeProvider } from '@emotion/react'
import { createTheme, CssBaseline } from '@mui/material'
import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ChangeQueries } from './components/changeQueries'
import { Main } from './components/main'
import { keys } from './config'
import { getDataFromStorage } from './helpers/localstorage'

const theme = createTheme({
  palette: {
    mode: 'dark'
  }
})

export function App() {
  const [isLocalServer, setIsLocalServer] = useState<boolean>(false)
  const [initalization, setInitialization] = useState(false)
  const changeLocal = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem(keys.isLocalServer, JSON.stringify({ isLocal: event.target.checked }))
    setIsLocalServer(event.target.checked)
  }

  useEffect(() => {
    const isLocalServerFromStorage = getDataFromStorage(keys.isLocalServer)
    if (isLocalServerFromStorage !== null) {
      setIsLocalServer(isLocalServerFromStorage.isLocal)
    }
    setInitialization(true)
  }, [])

  if (!initalization) {
    return null
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main isLocalServer={isLocalServer} changeLocal={changeLocal} />} />
          <Route path="change-queries" element={<ChangeQueries isLocalServer={isLocalServer} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
