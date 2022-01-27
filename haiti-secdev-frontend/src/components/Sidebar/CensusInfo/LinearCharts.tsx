import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles, Theme, Grid } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { SelectedItemType } from '../../../types';
import { linearCharts } from '../../../configuration/app-config';
import { formatDisplayNumber } from '../../../services/sharedFunctions';

interface Props {
  selectedItem: SelectedItemType;
}

const BorderLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 7,
      borderRadius: 5,
    },
    colorPrimary: {
      backgroundColor: theme.palette.secondary.main,
    },
    bar: {
      backgroundColor: theme.palette.primary.main,
    },
  }),
)(LinearProgress);

const LinearCharts: React.FC<Props> = ({ selectedItem }) => {
  // all functions assume the secondary value is a percentage represented as a number out of 100

  const getSecondaryPercentage = (secondaryPopulation: string) => {
    return parseFloat(secondaryPopulation).toFixed(1);
  };
  const getPrimaryPercentage = (secondaryPopulation: string) => {
    const secondary = parseFloat(secondaryPopulation);

    const primary = (100 - secondary).toFixed(1);

    return parseFloat(primary);
  };
  const useStyles = makeStyles(theme => ({
    smallHeader: {
      color: theme.palette.text.secondary,
      fontSize: '14px',
      fontWeight: 400,
      textTransform: 'uppercase',
    },
    subHeader: {
      fontSize: '18px',
      fontWeight: 800,
    },
    leftLabel: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.6rem',
    },
    rightLabel: {
      fontSize: '14px',
      textAlign: 'right',
      fontWeight: 400,
      lineHeight: '1.6rem',
    },
    barSpacing: {
      margin: '0.5rem 0',
    },
  }));
  const classes = useStyles();

  return (
    <Grid container>
      {linearCharts.map(item => {
        return (
          <React.Fragment key={item.chartId}>
            <Grid item xs={7}>
              <h1 className={classes.smallHeader}>{item.title}</h1>
            </Grid>
            <Grid item xs={6} className={classes.leftLabel}>
              <div className={classes.subHeader}>{item.labels.left}:</div>
              <div>
                {getPrimaryPercentage(selectedItem[item.data.secondaryCount])}%
              </div>
            </Grid>
            <Grid item xs={6} className={classes.rightLabel}>
              <div className={classes.subHeader}>{item.labels.right}:</div>
              <div>
                {getSecondaryPercentage(selectedItem[item.data.secondaryCount])}
                %
              </div>
            </Grid>
            <Grid item xs={12}>
              <BorderLinearProgress
                variant="determinate"
                value={getPrimaryPercentage(
                  selectedItem[item.data.secondaryCount],
                )}
                className={classes.barSpacing}
              />
            </Grid>
          </React.Fragment>
        );
      })}
    </Grid>
  );
};

export default LinearCharts;
