import React from 'react';
import { useSelector } from 'react-redux';
import { Box, makeStyles } from '@material-ui/core';
import {
  radarChartConfig,
  tractId,
  totalPopCol,
} from '../../../configuration/app-config';
import { AppState, SelectedItemType } from '../../../types';
import LinearCharts from './LinearCharts';
import RacialDistro from './RacialDistro';
import RiskIndex from './RiskIndex';
import CensusDetailsContainer from './CensusDetails/CensusDetailsContainer';
import RadarChart from '../RadarChart/RadarChart';

const CensusInfo: React.FC = () => {
  const selectedItem: SelectedItemType | null = useSelector(
    (state: AppState) => state.SidebarControl.selectedItem,
  );
  const useStyles = makeStyles(theme => ({
    root: {
      padding: '1rem',
    },
    popHeader: {
      color: theme.palette.text.primary,
      fontSize: '16px',
      fontWeight: 400,
    },
    smallHeader: {
      color: theme.palette.text.secondary,
      fontSize: '16px',
      fontWeight: 400,
      textTransform: 'uppercase',
    },
  }));
  const classes = useStyles();

  return (
    <>
      {selectedItem && (
        <div id="CensusInfo" className={classes.root}>
          {selectedItem !== null ? (
            <div>
              <h2 id="censusTract">
                Census Tract
                {'  '}
                {selectedItem[tractId]}
              </h2>
              <Box mt={-2}>
                <h3 className={classes.popHeader}>
                  Population {selectedItem[totalPopCol]}
                </h3>
              </Box>
              <div />
              <RiskIndex />

              <LinearCharts selectedItem={selectedItem} />
              <RacialDistro selectedItem={selectedItem} />
              {radarChartConfig.enabled && (
                <Box my={-5}>
                  <RadarChart
                    chartFields={radarChartConfig.fields}
                    selectedItem={selectedItem}
                  />
                </Box>
              )}

              <Box mt={3}>
                <div className={classes.smallHeader}>Index Details</div>
              </Box>
              <CensusDetailsContainer selectedItem={selectedItem} />
            </div>
          ) : null}
        </div>
      )}
    </>
  );
};

export default CensusInfo;
