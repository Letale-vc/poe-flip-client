import { Button, Checkbox, Link } from '@mui/material'
import { Box } from '@mui/system'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid'
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { adress, keys } from '../config'
import { FetchServerData, MainProps } from '../types/types'

const columns: GridColDef[] = [
  {
    field: 'card',
    headerName: 'card',
    renderCell: (params: GridValueGetterParams) => (
      <Link href={params.row.cardLink} target="_blank">
        {params.value}
      </Link>
    ),
    width: 200
  },
  {
    field: 'item',
    headerName: 'item',
    width: 200,
    renderCell: (params: GridValueGetterParams) => (
      <Link href={params.row.itemLink} target="_blank">
        {params.value}
      </Link>
    )
  },
  {
    field: 'stackSize',
    headerName: 'stackSize',
    type: 'number'
  },
  {
    field: 'cardChaosValue',
    headerName: 'cardChaos',
    type: 'number'
  },
  {
    field: 'cardExaltedValue',
    headerName: 'cardExalted',
    type: 'number'
  },
  {
    field: 'itemChaosValue',
    headerName: 'itemChaos',
    type: 'number'
  },

  {
    field: 'itemExaltedValue',
    headerName: 'itemExalted',
    type: 'number'
  },
  {
    field: 'profitInChaosPerCard',
    headerName: 'profitInChaosPerCard',
    type: 'number',
    width: 180
  },
  {
    field: 'profitInExaltedPerCard',
    headerName: 'profitInExaltedPerCard',
    type: 'number',
    width: 170
  },
  {
    field: 'profitInExalted',
    headerName: 'profitInExalted',
    type: 'number',
    width: 150
  },
  {
    field: 'profitInChaos',
    headerName: 'profitInChaos',
    type: 'number'
  },
  {
    field: 'description',
    headerName: 'description'
  },
  {
    field: 'cardLink',
    headerName: 'cardLink',
    hide: true
  },
  {
    field: 'itemLink',
    headerName: 'itemLink',
    hide: true
  }
]

export const Main: React.FC<MainProps> = ({ isLocalServer, changeLocal }) => {
  const [rows, setRows] = useState<object[]>([])

  const [nextUpdateData, setNextUpdateData] = useState<Date | undefined>()
  const [lastUpdateData, setlastUpdateData] = useState<Date | undefined>()
  const [isCanUpdatePoeTrade, setIsCanUpdatePoeTrade] = useState<boolean>(false)
  const [isFetch, setIsFetch] = useState<boolean>(false)
  const setAllState = (values: FetchServerData, key: string): void => {
    localStorage.setItem(key, JSON.stringify(values))
    setRows(values.rows)
    setNextUpdateData(new Date(values.canNextUpdate))
    setlastUpdateData(new Date(values.lastUpdate))
    setIsCanUpdatePoeTrade(values.canUpdate)
  }

  const hendlerPoeTradeGetData = async () => {
    setIsFetch(true)
    await fetch(`${isLocalServer ? 'http://localhost:8080' : 'https://poe-flip.helpless.keenetic.link'}/poeTrade`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.message) setAllState(json, keys.poeTrade)
        else if (json.message) {
          setIsCanUpdatePoeTrade(true)
        }
      })
      .catch((error) => {
        console.error(error)
      })
    setIsFetch(false)
  }
  const hendlerPoeTradeUpdate = async () => {
    setIsFetch(true)
    setIsCanUpdatePoeTrade(false)
    await fetch(`${isLocalServer ? 'http://localhost:8080' : adress}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.message) setAllState(json, keys.poeTrade)
      })
      .catch((error) => {
        console.log(error)
      })
    setIsFetch(false)
  }

  const hendlerPoeNinjaUpdate = async () => {
    setIsFetch(true)
    await fetch(`${isLocalServer ? 'http://localhost:8080' : adress}/ninja`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rows)
    })
      .then((res) => res.json())
      .then((json) => {
        setAllState(json, keys.poeninja)
      })
      .catch((error) => {
        console.log(error)
      })
    setIsFetch(false)
  }

  return (
    <Box sx={{ width: '100%', height: '100vh' }}>
      <Box display="flex" justifyContent="flex-start" alignItems="center">
        <Button onClick={hendlerPoeNinjaUpdate} disabled={isFetch}>
          load and update poeninja
        </Button>
        <Button onClick={hendlerPoeTradeGetData} disabled={isFetch}>
          load poe trade
        </Button>
        <Button onClick={hendlerPoeTradeUpdate} disabled={!isCanUpdatePoeTrade || isFetch}>
          update poe trade
        </Button>
        <Box marginLeft={2}>
          {lastUpdateData
            ? `Last update --- ${lastUpdateData?.getHours()}:${lastUpdateData?.getMinutes()}:${lastUpdateData?.getSeconds()}`
            : null}
        </Box>

        <Box marginLeft={2} flexGrow={1}>
          {nextUpdateData
            ? `Can next update --- ${nextUpdateData?.getHours()}:${nextUpdateData?.getMinutes()}:${nextUpdateData?.getSeconds()}`
            : null}
        </Box>
        <Button component={NavLink} to="/change-queries">
          change queries
        </Button>
        <Box>
          To receive from the local server?
          <Checkbox checked={isLocalServer} onChange={changeLocal} />
        </Box>
      </Box>

      <DataGrid
        getRowId={(row) => `${row.card}_${row.item}`}
        rows={rows}
        columns={columns}
        disableSelectionOnClick
        autoHeight
        density="compact"
        hideFooter
      />
    </Box>
  )
}

// https://www.pathofexile.com/trade/search/Sentinel?q={%22query%22:{%22type%22:%22The%20Apothecary%22}}
