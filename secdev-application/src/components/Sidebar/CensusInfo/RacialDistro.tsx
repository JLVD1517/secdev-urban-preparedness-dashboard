import React from 'react';
import { Box, Grid, makeStyles } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Tooltip from '@material-ui/core/Tooltip';
import { racialDistInfo } from '../../../configuration/app-config';
import { formatDisplayNumber } from '../../../services/sharedFunctions';
import { SelectedItemType } from '../../../types';

interface RacialDistroProps {
  selectedItem: SelectedItemType;
}
const RacialDistro: React.FC<RacialDistroProps> = ({ selectedItem }) => {
  const useStyles = makeStyles(theme => ({
    smallHeader: {
      color: theme.palette.text.secondary,
      fontSize: '14px',
      fontWeight: 400,
      textTransform: 'uppercase',
    },
    subHeader: {
      fontSize: '16px',
      fontWeight: 800,
    },
    containerSpacing: {
      marginTop: '20px',
    },
    infoIcon: {
      color: theme.palette.text.primary,
      fontSize: '14px',
    },
  }));
  const classes = useStyles();
  return (
    <>
      {racialDistInfo.length > 0 && (
        <Box mt={3}>
          <Tooltip
            title="Categories defined by US Census, may add to more than 100%"
            arrow
          >
            <h2 className={classes.smallHeader}>
              Racial Distribution {'  '}
              <InfoOutlinedIcon className={classes.infoIcon} />
            </h2>
          </Tooltip>
        </Box>
      )}

      <Grid container>
        {racialDistInfo.map(item => {
          return (
            <React.Fragment key={item.colName}>
              <Grid item xs={6}>
                <Box my={1}>
                  {' '}
                  <div className={classes.subHeader}>{item.title}</div>
                  <div className={classes.smallHeader}>
                    {formatDisplayNumber(selectedItem[item.colName])}%
                  </div>
                </Box>
              </Grid>
            </React.Fragment>
          );
        })}
      </Grid>
    </>
  );
};
export default RacialDistro;
