import React from 'react';
import { Theme, useMediaQuery, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { useSelector } from 'react-redux';
import { AppState } from '../../types';
import { componentSizing } from '../../services/component-sizing';

const MapSearch: React.FC = () => {
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('sm'));

  const desktopCollapse: boolean = useSelector(
    (state: AppState) => state.SidebarControl.desktopCollapse,
  );

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      searchBar: {
        position: 'absolute',
        right: desktopCollapse
          ? `calc(${componentSizing.desktopSideBarWidthCollapse} + 25px)`
          : `calc(${componentSizing.desktopSideBarWidth} + 25px)`,
      },
    }),
  );
  const classes = useStyles();

  return (
    <div id="MapSearchBar" className={!mobileView ? classes.searchBar : ''} />
  );
};

export default MapSearch;
