import React, { FC, useEffect, useState } from "react"
import { useRecoilValue } from "recoil"
import { Link, useParams } from "react-router-dom"
import { createStyles, fade, makeStyles, Theme } from "@material-ui/core/styles"
import {
  AppBar,
  Dialog,
  Checkbox,
  Card,
  Typography,
  CardContent,
  Container,
  Grid,
  Toolbar,
  Paper,
  Box,
  IconButton,
  Select,
  MenuItem,
  FormGroup,
} from "@material-ui/core"
import { Home, Cached, Settings } from "@material-ui/icons"
import CloseIcon from "@material-ui/icons/Close"
import { DataGridColumn, DataGrid } from "./DataGrid"
import { GraphParallelCoordinate } from "./GraphParallelCoordinate"
import { GraphHyperparameterImportances } from "./GraphHyperparameterImportances"
import { Edf } from "./GraphEdf"

import { GraphIntermediateValues } from "./GraphIntermediateValues"
import { GraphSlice } from "./GraphSlice"
import { GraphHistory } from "./GraphHistory"
import { GraphParetoFront } from "./GraphParetoFront"
import { actionCreator } from "../action"
import { studyDetailsState } from "../state"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import MuiDialogTitle from "@material-ui/core/DialogTitle"
import MuiDialogContent from "@material-ui/core/DialogContent"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      margin: theme.spacing(2),
      padding: theme.spacing(2),
    },
    card: {
      margin: theme.spacing(2),
    },
    reload: {
      position: "relative",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      "&:hover": {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(1),
        width: "auto",
      },
    },
    reloadIcon: {
      padding: theme.spacing(0, 2),
      height: "100%",
      position: "absolute",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    reloadSelect: {
      color: "inherit",
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        width: "14ch",
        "&:focus": {
          width: "20ch",
        },
      },
    },
    grow: {
      flexGrow: 1,
    },
    dialogTitle: {
      margin: 0,
      padding: theme.spacing(2),
      minWidth: 300,
    },
    dialogCloseButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    containerStyle: {
      ["@media (min-width: 1280px)"]: {
        maxWidth: "100%",
      },
    },
  })
)

interface ParamTypes {
  studyId: string
}

const isSingleObjectiveStudy = (studyDetail: StudyDetail): boolean => {
  return studyDetail.directions.length === 1
}

export const useStudyDetailValue = (studyId: number): StudyDetail | null => {
  const studyDetails = useRecoilValue<StudyDetails>(studyDetailsState)
  return studyDetails[studyId] || null
}

export const StudyDetail: FC = () => {
  const classes = useStyles()
  const action = actionCreator()
  const { studyId } = useParams<ParamTypes>()
  const studyIdNumber = parseInt(studyId, 10)
  const studyDetail = useStudyDetailValue(studyIdNumber)
  const [openReloadIntervalSelect, setPrefOpenReloadIntervalSelect] =
    useState<boolean>(false)
  const [reloadInterval, setReloadInterval] = useState<number>(10)
  const savedPref = localStorage.getItem("savedPref")
  const graphsChecked =
    savedPref !== null
      ? JSON.parse(savedPref)
      : {
          graphHistoryChecked: true,
          graphParetoFrontChecked: true,
          graphParallelCoordinateChecked: true,
          graphIntermediateValuesChecked: true,
          edfChecked: true,
          graphHyperparameterImportancesChecked: true,
          graphSliceChecked: true,
        }

  const [prefOpen, setPrefOpen] = React.useState(false)
  const handleClickOpen = () => {
    setPrefOpen(true)
  }
  const handleClose = () => {
    setPrefOpen(false)
  }
  const [chartsShown, setChartsShown] = React.useState(graphsChecked)
  useEffect(() => {
    localStorage.setItem("savedPref", JSON.stringify(chartsShown))
  }, [chartsShown])
  const handleChartShownChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setChartsShown({
      ...chartsShown,
      [event.target.name]: event.target.checked,
    })
  }

  useEffect(() => {
    action.updateStudyDetail(studyIdNumber)
  }, [])

  useEffect(() => {
    if (reloadInterval < 0) {
      return
    }
    const intervalId = setInterval(function () {
      action.updateStudyDetail(studyIdNumber)
    }, reloadInterval * 1000)
    return () => clearInterval(intervalId)
  }, [reloadInterval, studyDetail])
  // TODO(chenghuzi): Reduce the number of calls to setInterval and clearInterval.

  const title = studyDetail !== null ? studyDetail.name : `Study #${studyId}`
  const trials: Trial[] = studyDetail !== null ? studyDetail.trials : []

  return (
    <div>
      <Dialog onClose={handleClose} aria-labelledby="vis-pref" open={prefOpen}>
        <MuiDialogTitle disableTypography className={classes.dialogTitle}>
          <div>
            <Typography variant="h6">Visualization Preference</Typography>
          </div>

          <IconButton
            aria-label="close"
            className={classes.dialogCloseButton}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </MuiDialogTitle>

        <MuiDialogContent dividers>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={chartsShown.graphHistoryChecked}
                  onChange={handleChartShownChange}
                  name="graphHistoryChecked"
                />
              }
              label="History"
            />
            <FormControlLabel
              disabled={
                studyDetail !== null && isSingleObjectiveStudy(studyDetail)
              }
              control={
                <Checkbox
                  checked={chartsShown.graphParetoFrontChecked}
                  onChange={handleChartShownChange}
                  name="graphParetoFrontChecked"
                />
              }
              label="Pareto Front"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={chartsShown.graphParallelCoordinateChecked}
                  onChange={handleChartShownChange}
                  name="graphParallelCoordinateChecked"
                />
              }
              label="Parallel Coordinate"
            />
            <FormControlLabel
              disabled={
                studyDetail !== null && !isSingleObjectiveStudy(studyDetail)
              }
              control={
                <Checkbox
                  checked={chartsShown.graphIntermediateValuesChecked}
                  onChange={handleChartShownChange}
                  name="graphIntermediateValuesChecked"
                />
              }
              label="Intermediate Values"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={chartsShown.edfChecked}
                  onChange={handleChartShownChange}
                  name="edfChecked"
                />
              }
              label="Edf"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={chartsShown.graphHyperparameterImportancesChecked}
                  onChange={handleChartShownChange}
                  name="graphHyperparameterImportancesChecked"
                />
              }
              label="Hyperparameter Importances"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={chartsShown.graphSliceChecked}
                  onChange={handleChartShownChange}
                  name="graphSliceChecked"
                />
              }
              label="Slice"
            />
          </FormGroup>
        </MuiDialogContent>
      </Dialog>
      <AppBar position="static">
        <Container className={classes.containerStyle}>
          <Toolbar>
            <Typography variant="h6">{APP_BAR_TITLE}</Typography>
            <div className={classes.grow} />
            <div
              className={classes.reload}
              onClick={() => {
                setPrefOpenReloadIntervalSelect(!openReloadIntervalSelect)
              }}
            >
              <div className={classes.reloadIcon}>
                <Cached />
              </div>
              <Select
                value={reloadInterval}
                className={classes.reloadSelect}
                open={openReloadIntervalSelect}
                onOpen={() => {
                  setPrefOpenReloadIntervalSelect(true)
                }}
                onClose={() => {
                  setPrefOpenReloadIntervalSelect(false)
                }}
                onChange={(e) => {
                  setReloadInterval(e.target.value as number)
                }}
              >
                <MenuItem value={-1}>stop</MenuItem>
                <MenuItem value={5}>5s</MenuItem>
                <MenuItem value={10}>10s</MenuItem>
                <MenuItem value={30}>30s</MenuItem>
                <MenuItem value={60}>60s</MenuItem>
              </Select>
            </div>

            <IconButton color="inherit" onClick={handleClickOpen}>
              <Settings />
            </IconButton>
            <IconButton
              aria-controls="menu-appbar"
              aria-haspopup="true"
              component={Link}
              to={URL_PREFIX + "/"}
              color="inherit"
            >
              <Home />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      <Container className={classes.containerStyle}>
        <div>
          <Paper className={classes.paper}>
            <Typography variant="h6">{title}</Typography>
          </Paper>
          {chartsShown.graphHistoryChecked ? (
            <Card className={classes.card}>
              <CardContent>
                <GraphHistory study={studyDetail} />
              </CardContent>
            </Card>
          ) : null}

          {studyDetail !== null &&
          !isSingleObjectiveStudy(studyDetail) &&
          chartsShown.graphParetoFrontChecked ? (
            <Card className={classes.card}>
              <CardContent>
                <GraphParetoFront study={studyDetail} />
              </CardContent>
            </Card>
          ) : null}
          {chartsShown.graphParallelCoordinateChecked ? (
            <Card className={classes.card}>
              <CardContent>
                <GraphParallelCoordinate study={studyDetail} />
              </CardContent>
            </Card>
          ) : null}

          {studyDetail !== null &&
          isSingleObjectiveStudy(studyDetail) &&
          chartsShown.graphIntermediateValuesChecked ? (
            <Card className={classes.card}>
              <CardContent>
                <GraphIntermediateValues trials={trials} />
              </CardContent>
            </Card>
          ) : null}
          {chartsShown.edfChecked ? (
            <Card className={classes.card}>
              <CardContent>
                <Edf study={studyDetail} />
              </CardContent>
            </Card>
          ) : null}
          {chartsShown.graphHyperparameterImportancesChecked ? (
            <Card className={classes.card}>
              <CardContent>
                <GraphHyperparameterImportances
                  study={studyDetail}
                  studyId={studyIdNumber}
                />
              </CardContent>
            </Card>
          ) : null}

          {studyDetail !== null && chartsShown.graphSliceChecked ? (
            <Card className={classes.card}>
              <CardContent>
                <GraphSlice study={studyDetail} />
              </CardContent>
            </Card>
          ) : null}
          <Card className={classes.card}>
            <TrialTable studyDetail={studyDetail} />
          </Card>
        </div>
      </Container>
    </div>
  )
}

export const TrialTable: FC<{ studyDetail: StudyDetail | null }> = ({
  studyDetail,
}) => {
  const trials: Trial[] = studyDetail !== null ? studyDetail.trials : []

  const columns: DataGridColumn<Trial>[] = [
    { field: "number", label: "Number", sortable: true, padding: "none" },
    {
      field: "state",
      label: "State",
      sortable: true,
      filterable: true,
      padding: "none",
      toCellValue: (i) => trials[i].state.toString(),
    },
  ]
  if (studyDetail === null || isSingleObjectiveStudy(studyDetail)) {
    columns.push({
      field: "values",
      label: "Value",
      sortable: true,
      less: (firstEl, secondEl): number => {
        const firstVal = firstEl.values?.[0]
        const secondVal = secondEl.values?.[0]

        if (firstVal === secondVal) {
          return 0
        } else if (firstVal && secondVal) {
          return firstVal < secondVal ? 1 : -1
        } else if (firstVal) {
          return -1
        } else {
          return 1
        }
      },
      toCellValue: (i) => {
        if (trials[i].values === undefined) {
          return null
        }
        return trials[i].values?.[0]
      },
    })
  } else {
    const objectiveColumns: DataGridColumn<Trial>[] =
      studyDetail.directions.map((s, objectiveId) => ({
        field: "values",
        label: `Objective ${objectiveId}`,
        sortable: true,
        less: (firstEl, secondEl): number => {
          const firstVal = firstEl.values?.[objectiveId]
          const secondVal = secondEl.values?.[objectiveId]

          if (firstVal === secondVal) {
            return 0
          } else if (firstVal && secondVal) {
            return firstVal < secondVal ? 1 : -1
          } else if (firstVal) {
            return -1
          } else {
            return 1
          }
        },
        toCellValue: (i) => {
          if (trials[i].values === undefined) {
            return null
          }
          return trials[i].values?.[objectiveId]
        },
      }))
    columns.push(...objectiveColumns)
  }
  columns.push({
    field: "datetime_start",
    label: "Duration(ms)",
    toCellValue: (i) => {
      const startMs = trials[i].datetime_start?.getTime()
      const completeMs = trials[i].datetime_complete?.getTime()
      if (startMs !== undefined && completeMs !== undefined) {
        return (completeMs - startMs).toString()
      }
      return null
    },
    sortable: true,
    less: (firstEl, secondEl): number => {
      const firstStartMs = firstEl.datetime_start?.getTime()
      const firstCompleteMs = firstEl.datetime_complete?.getTime()
      const firstDurationMs =
        firstStartMs !== undefined && firstCompleteMs !== undefined
          ? firstCompleteMs - firstStartMs
          : undefined
      const secondStartMs = secondEl.datetime_start?.getTime()
      const secondCompleteMs = secondEl.datetime_complete?.getTime()
      const secondDurationMs =
        secondStartMs !== undefined && secondCompleteMs !== undefined
          ? secondCompleteMs - secondStartMs
          : undefined

      if (firstDurationMs === secondDurationMs) {
        return 0
      } else if (
        firstDurationMs !== undefined &&
        secondDurationMs !== undefined
      ) {
        return firstDurationMs < secondDurationMs ? 1 : -1
      } else if (firstDurationMs !== undefined) {
        return -1
      } else {
        return 1
      }
    },
  })
  columns.push({
    field: "params",
    label: "Params",
    toCellValue: (i) =>
      trials[i].params.map((p) => p.name + ": " + p.value).join(", "),
  })

  const collapseParamColumns: DataGridColumn<TrialParam>[] = [
    { field: "name", label: "Name", sortable: true },
    { field: "value", label: "Value", sortable: true },
  ]
  const collapseIntermediateValueColumns: DataGridColumn<TrialIntermediateValue>[] =
    [
      { field: "step", label: "Step", sortable: true },
      { field: "value", label: "Value", sortable: true },
    ]
  const collapseAttrColumns: DataGridColumn<Attribute>[] = [
    { field: "key", label: "Key", sortable: true },
    { field: "value", label: "Value", sortable: true },
  ]

  const collapseBody = (index: number) => {
    return (
      <Grid container direction="row">
        <Grid item xs={6}>
          <Box margin={1}>
            <Typography variant="h6" gutterBottom component="div">
              Parameters
            </Typography>
            <DataGrid<TrialParam>
              columns={collapseParamColumns}
              rows={trials[index].params}
              keyField={"name"}
              dense={true}
              rowsPerPageOption={[5, 10, { label: "All", value: -1 }]}
            />
            <Typography variant="h6" gutterBottom component="div">
              Trial user attributes
            </Typography>
            <DataGrid<Attribute>
              columns={collapseAttrColumns}
              rows={trials[index].user_attrs}
              keyField={"key"}
              dense={true}
              rowsPerPageOption={[5, 10, { label: "All", value: -1 }]}
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box margin={1}>
            <Typography variant="h6" gutterBottom component="div">
              Intermediate values
            </Typography>
            <DataGrid<TrialIntermediateValue>
              columns={collapseIntermediateValueColumns}
              rows={trials[index].intermediate_values}
              keyField={"step"}
              dense={true}
              rowsPerPageOption={[5, 10, { label: "All", value: -1 }]}
            />
            <Typography variant="h6" gutterBottom component="div">
              Trial system attributes
            </Typography>
            <DataGrid<Attribute>
              columns={collapseAttrColumns}
              rows={trials[index].system_attrs}
              keyField={"key"}
              dense={true}
              rowsPerPageOption={[5, 10, { label: "All", value: -1 }]}
            />
          </Box>
        </Grid>
      </Grid>
    )
  }

  return (
    <DataGrid<Trial>
      columns={columns}
      rows={trials}
      keyField={"trial_id"}
      dense={true}
      collapseBody={collapseBody}
    />
  )
}
