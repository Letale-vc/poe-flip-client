/* eslint-disable react/no-unstable-nested-components */
import { Alert, AlertProps, Box, Button, IconButton, Snackbar, TextField } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { useState, useEffect, FC, useCallback } from 'react'
import { DataGrid, GridColDef, GridRowModel, GridValueGetterParams } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import { adress } from '../config'

interface ChangeQueriesProps {
  isLocalServer: boolean
}
export const ChangeQueries: FC<ChangeQueriesProps> = ({ isLocalServer }) => {
  const [rows, setRows] = useState<{ cardQuery: string; itemQuery: string }[]>([])
  const [newRow, setNewRow] = useState<{ cardQuery: string; itemQuery: string }>({ cardQuery: '', itemQuery: '' })
  const [snackbar, setSnackbar] = useState<Pick<AlertProps, 'children' | 'severity'> | null>(null)

  const handleCloseSnackbar = () => setSnackbar(null)

  useEffect(() => {
    const getQueries = async () => {
      try {
        const res = await fetch(`${isLocalServer ? 'http://localhost:8080' : adress}/poeQueries`)
        const data = (await res.json()) as any
        setRows(data)
      } catch (err) {
        console.error(err)
      }
    }

    if (rows.length === 0) {
      getQueries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: 'error' })
  }, [])

  const addRowFromServerHandler = async () => {
    try {
      await fetch(`${isLocalServer ? 'http://localhost:8080' : adress}/poeQueries`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...rows, newRow])
      })

      setRows([...rows, newRow])
      setSnackbar({ children: 'Successfully saved', severity: 'success' })
    } catch (err: any) {
      setSnackbar({ children: err.message, severity: 'error' })
    }
  }
  const processRowUpdate = useCallback(
    async (newGridRow: GridRowModel) => {
      const newRows = await Promise.all(
        rows.map((row) => {
          if (newGridRow.id === JSON.parse(row.cardQuery).query?.type) {
            return newGridRow
          }
          return row
        })
      )
      // Make the HTTP request to save in the backend
      await fetch(`${isLocalServer ? 'http://localhost:8080' : adress}/poeQueries`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRows)
      })

      setRows(
        rows.map((row) => {
          if (newGridRow.id === JSON.parse(row.cardQuery).query?.type) {
            return newGridRow
          }
          return row
        })
      )
      setSnackbar({ children: 'Successfully saved', severity: 'success' })

      return newGridRow
    },
    [isLocalServer, rows]
  )

  const deleteRowHandlerFromServer = async (deletedRow) => {
    try {
      const newRows = rows.filter((row) => row.cardQuery !== deletedRow.cardQuery)
      // Make the HTTP request to save in the backend
      await fetch(`${isLocalServer ? 'http://localhost:8080' : adress}/poeQueries`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRows)
      })

      setRows(newRows)
      setSnackbar({ children: 'Successfully saved', severity: 'success' })
    } catch (err: any) {
      setSnackbar({ children: err.message, severity: 'error' })
    }
  }
  const columns: GridColDef[] = [
    {
      field: 'cardToItem',
      headerName: 'CARD TO ITEM NAME',
      width: 500,
      sortable: false,
      filterable: false,
      valueGetter: (params: GridValueGetterParams) => {
        const nameCard = JSON.parse(params.row.cardQuery).query?.type
        let nameItemJson
        try {
          nameItemJson = JSON.parse(params.row.itemQuery)
        } catch (err) {
          return `${nameCard} -> ${params.row.itemQuery}`
        }

        const { query } = nameItemJson
        let nameItem
        if (query?.type && query?.name) {
          nameItem = query.name
        } else if (query?.type) {
          nameItem = query.type
        } else if (typeof query.name === 'object') {
          nameItem = query.name.option
        } else if (query.name) {
          nameItem = query.name
        } else {
          nameItem = undefined
        }

        return `${nameCard} -> ${nameItem}`
      }
    },
    {
      field: 'cardQuery',
      headerName: 'cardQuery',
      width: 500,
      sortable: false,
      filterable: false,
      editable: true
    },

    {
      field: 'itemQuery',
      headerName: 'itemQuery',
      width: 500,
      sortable: false,
      filterable: false,
      editable: true
    },
    {
      field: 'options',
      headerName: 'options',
      sortable: false,
      filterable: false,
      renderCell: (params: GridValueGetterParams) => [
        <IconButton
          key={params.id}
          aria-label="delete"
          onClick={() => {
            deleteRowHandlerFromServer(params.row)
          }}
        >
          <DeleteIcon />
        </IconButton>
      ]
    }
  ]

  return (
    <div>
      <div>
        <Button component={NavLink} to="/">
          go to main
        </Button>
      </div>
      <Box display="flex">
        <TextField
          sx={{ width: 499, marginLeft: 62 }}
          id="cardQuery"
          label="Card query"
          variant="filled"
          value={newRow.cardQuery}
          onChange={(ev) => setNewRow({ ...newRow, cardQuery: ev.target.value })}
        />
        <TextField
          sx={{ width: 499, marginLeft: 1 }}
          id="itemQuery"
          label="Item query"
          variant="filled"
          value={newRow.itemQuery}
          onChange={(ev) => setNewRow({ ...newRow, itemQuery: ev.target.value })}
        />
        <Button onClick={addRowFromServerHandler}>Add new query</Button>
      </Box>
      <div>
        <DataGrid
          getRowId={(row) => JSON.parse(row.cardQuery).query?.type}
          rows={rows}
          columns={columns}
          disableSelectionOnClick
          autoHeight
          density="compact"
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          experimentalFeatures={{ newEditingApi: true }}
          hideFooter
        />
      </div>
      {!!snackbar && (
        <Snackbar
          open
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          onClose={handleCloseSnackbar}
          autoHideDuration={6000}
        >
          <Alert {...snackbar} onClose={handleCloseSnackbar} />
        </Snackbar>
      )}
    </div>
  )
}
