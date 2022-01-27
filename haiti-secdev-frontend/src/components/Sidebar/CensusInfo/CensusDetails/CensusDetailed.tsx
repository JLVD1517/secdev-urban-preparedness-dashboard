import React, { useState } from 'react';
import { Grid, Box, IconButton, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { formatDisplayNumber } from '../../../../services/sharedFunctions';
import { CensusDetailedType } from '../../../../types';

interface CensusDetailedProps {
  item: CensusDetailedType;
}

const CensusDetailed: React.FC<CensusDetailedProps> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const useStyles = makeStyles({
    detailedExpanded: {
      'background-color': theme.palette.background.paper,
      'border-radius': '4px',
      'margin-top': '10px',
      'margin-bottom': '10px',
      transition: 'background-color 150ms ease',
    },
    rotate: {
      transform: 'rotate(180deg)',
      transition: 'transform 150ms ease',
    },
    unRotated: {
      transition: 'transform 150ms ease',
    },
    title: {
      'font-weight': '300',
      'font-size': '16px',
    },
    number: {
      'font-weight': '700',
      'font-size': '18px',
    },
  });

  const toggleCard = () => {
    setExpanded(!expanded);
  };

  let info;
  if (expanded) {
    info = item.fields.map(field => {
      return (
        <p key={field.title}>
          {field.title} - {formatDisplayNumber(field.value)}
          {field.percentValue && (
            <span> - {formatDisplayNumber(field.percentValue)}%</span>
          )}
        </p>
      );
    });
  } else {
    info = null;
  }
  const classes = useStyles();
  return (
    <Grid container>
      <Grid container className={expanded ? classes.detailedExpanded : ''}>
        <Grid item xs={10}>
          <Box mx={1}>
            <div>
              <p>
                <span className={classes.number}>
                  {formatDisplayNumber(item.value)}
                </span>{' '}
                <br /> <span className={classes.title}>{item.title}</span>
              </p>
            </div>
          </Box>
        </Grid>
        <Grid item xs={2}>
          <div>
            <IconButton
              aria-label="expand"
              onClick={toggleCard}
              className={expanded ? classes.rotate : classes.unRotated}
            >
              <ExpandMoreIcon />
            </IconButton>
          </div>
        </Grid>
        <Grid item xs={12}>
          <Box mx={1} mt={-2}>
            {info}
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default CensusDetailed;
