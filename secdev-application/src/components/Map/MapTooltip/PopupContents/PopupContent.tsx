import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  getColor,
  getRating,
  formatDisplayNumber,
} from '../../../../services/sharedFunctions';
import {
  primaryScore,
  tractId,
  mapLayers,
  totalPopCol,
  communeNameKey,
} from '../../../../configuration/app-config';
import { AppState, SelectedItemType } from '../../../../types';
import {
  mapGradientDark,
  mapGradientLight,
} from '../../../../configuration/theme-color-config';

interface PopupContentProps {
  clickedItem: SelectedItemType;
  darkTheme: boolean;
}

const getLayerName = (id: string) => {
  const found = mapLayers.find(layer => layer.colName === id);

  if (found) {
    return found.title;
  }
  return 'Error: no match';
};

const PopupContent: React.FC<PopupContentProps> = ({
  clickedItem,
  darkTheme,
}) => {
  const selectedLayerId: string = useSelector(
    (state: AppState) => state.SidebarControl.selectedLayerId,
  );

  const indexValue = () => {
    return parseFloat(clickedItem[selectedLayerId]);
  };

  const useStyles = makeStyles({
    root: {
      borderTop: `12px solid ${getColor(
        indexValue(),
        darkTheme ? mapGradientDark : mapGradientLight,
      )}`,
      padding: '1rem',
      paddingRight: '1.5rem',
    },
    title: {
      fontSize: 14,
    },
    bigText: {
      fontSize: '16px',
      fontWeight: 700,
      lineHeight: '18.45px',
    },
  });

  const classes = useStyles();

  return (
    <Card id="PopupContent" className={classes.root}>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        className={classes.bigText}
      >
        {clickedItem[communeNameKey]}
      </Typography>

      <Typography className={classes.title} color="textSecondary" gutterBottom>
        No of groups:
      </Typography>

      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        className={classes.bigText}
      >
        {(clickedItem[primaryScore] as any as number) > 0
          ? clickedItem[primaryScore]
          : '-'}
      </Typography>
    </Card>
  );
};

export default PopupContent;
