import React from 'react';
import { useSelector } from 'react-redux';
import { Box, makeStyles } from '@material-ui/core';
import { getColor, getRating } from '../../../services/sharedFunctions';
import { primaryScore } from '../../../configuration/app-config';
import { AppState, SelectedItemType } from '../../../types';
import {
  mapGradientDark,
  mapGradientLight,
} from '../../../configuration/theme-color-config';

const RiskIndex: React.FC = () => {
  const darkTheme: boolean = useSelector(
    (state: AppState) => state.AppControl.darkTheme,
  );

  const selectedItem: SelectedItemType | null = useSelector(
    (state: AppState) => state.SidebarControl.selectedItem,
  );

  const indexScoreFloat = () => {
    return parseFloat(selectedItem![primaryScore]);
  };

  const useStyles = makeStyles(theme => ({
    root: {
      padding: '0, 1rem',
    },
    smallHeader: {
      color: theme.palette.text.secondary,
      fontSize: '14px',
      fontWeight: 400,
      textTransform: 'uppercase',
    },
    riskScore: {
      margin: 0,
    },
    riskBox: {
      height: '5.5rem',
      width: '8.25rem',
      padding: '8px',
      border: `3px solid ${getColor(
        indexScoreFloat(),
        darkTheme ? mapGradientDark : mapGradientLight,
      )}`,
      borderRadius: '3px',
    },
    riskText: {
      fontSize: '18px',
      fontWeight: 400,
    },
  }));

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <h4 className={classes.smallHeader}>OVERALL INDEX SCORE</h4>
      <div className={classes.riskBox}>
        <h1 className={classes.riskScore}>{indexScoreFloat().toFixed(2)}</h1>
        <Box mt={-3}>
          <p className={classes.riskText}>
            {getRating(indexScoreFloat())} Risk
          </p>
        </Box>
      </div>
    </div>
  );
};

export default RiskIndex;
