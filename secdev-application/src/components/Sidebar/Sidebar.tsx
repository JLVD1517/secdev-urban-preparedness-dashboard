import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Select,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  ArrowBack,
  CalendarToday,
  SignalCellularAlt,
} from '@material-ui/icons';
import CensusInfo from './CensusInfo/CensusInfo';
import FilterSlider from './Sliders/FilterSlider';
import DateSlider from './Sliders/DateSlider';
import { AppState, MapGradientType, SelectedItemType } from '../../types';
import {
  setDesktopCollapse,
  setSelectedLayerId,
  setSelectedYear,
} from '../../store/modules/sidebarControlStore';
import {
  availableYears,
  primaryScore,
  sidebarText,
} from '../../configuration/app-config';
import { formatDisplayNumber } from '../../services/sharedFunctions';
import { componentSizing } from '../../services/component-sizing';
import GangInfo from './GangInfo/GangInfo';
import SelectGroup from '../SelectBox/SelectGroup';

interface SidebarProps {
  mapGradient: MapGradientType;
}

const Sidebar: React.FC<SidebarProps> = ({ mapGradient }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const mobileView = useMediaQuery(theme.breakpoints.down('sm'));

  // state for the collapsed mobile sidebar
  const [mobileCollapse, setMobileCollapse] = useState(false);

  const desktopCollapse: boolean = useSelector(
    (state: AppState) => state.SidebarControl.desktopCollapse,
  );

  const selectedYear: number | number[] = useSelector(
    (state: AppState) => state.SidebarControl.selectedYear,
  );

  const selectedItem: SelectedItemType | null = useSelector(
    (state: AppState) => state.SidebarControl.selectedItem,
  );

  const handleYearSelection = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    dispatch(setSelectedYear(event.target.value as number));
  };

  const mobileToggle = () => {
    setMobileCollapse(!mobileCollapse);
  };

  const desktopToggle = () => {
    dispatch(setDesktopCollapse(!desktopCollapse));
  };

  useEffect(
    () => {
      if (mobileView) {
        dispatch(setDesktopCollapse(false));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mobileView],
  );

  const useStyles = makeStyles(theme => ({
    root: {
      backgroundColor: theme.palette.background.default,
      position: 'fixed',
      right: 0,
      height: '100vh',
      zIndex: 1100,
      width: componentSizing.desktopSideBarWidth,
      textAlign: 'left',
      borderRadius: 0,
      borderLeft: '1.5px solid #484848',
      'overflow-y': 'scroll !important',
      '&.mobile': {
        top: 'calc(100% - 45vh)',
        width: '100%',
        height: '45vh',
        '&.collapse': {
          top: 'calc(100% - 15vh)',
          'overflow-y': 'hidden',
        },
        '.collapse-toggle-btn': {
          '.toggle-text': {
            fontSize: '0.7rem',
            color: theme.palette.primary.main,
          },
        },
      },
      '&.desktopCollapse': {
        width: componentSizing.desktopSideBarWidthCollapse,
      },
    },
    collapseButton: {
      transform: 'rotate(180deg)',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 250,
    },
    toggleText: {
      color: theme.palette.primary.main,
      fontSize: '0.7rem',
    },
    collapseContent: {
      marginTop: '35vh',
    },
    mainHeader: {
      textAlign: 'center',
    },
  }));

  const classes = useStyles();
  return (
    <Card
      id="sidebar-container"
      className={`${classes.root} ${mobileView ? 'mobile' : ''} 
      ${mobileCollapse ? 'collapse' : ''} 
      ${desktopCollapse ? 'desktopCollapse' : ''}`}
    >
      <CardContent>
        {mobileView ? (
          <Button
            onClick={mobileToggle}
            className="collapse-toggle-btn"
            name="toggle panel"
          >
            {mobileCollapse ? <KeyboardArrowUp /> : <KeyboardArrowDown />}{' '}
            <span className={classes.toggleText}>- Toggle Panel</span>
          </Button>
        ) : (
          <Box>
            <IconButton
              aria-label="collapse"
              className={!desktopCollapse ? classes.collapseButton : ''}
              onClick={desktopToggle}
              size="small"
            >
              <ArrowBack fontSize="small" />
            </IconButton>
          </Box>
        )}
        {!desktopCollapse ? (
          <div>
            <h1 className={classes.mainHeader}>
              Community Violence Reduction Dashboard
            </h1>
            <Box
              my={3}
              mx="auto"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FormControl className={classes.formControl} variant="outlined">
                <InputLabel htmlFor="IndexSelect">
                  Select year
                </InputLabel>
                <Select
                  id="IndexSelect"
                  label="Select Year"
                  native
                  value={selectedYear}
                  onChange={handleYearSelection}
                >
                  {availableYears.map(item => {
                    return (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
            <SelectGroup/>      
            <DateSlider />
            <FilterSlider mapGradient={mapGradient} />
            <p>{sidebarText}</p>
            {selectedItem && <h2 className="main-header">Group Details</h2>}
            <GangInfo/>
          </div>
        ) : (
          <Grid
            container
            direction="column"
            alignItems="center"
            justify="center"
            className={classes.collapseContent}
          >
            <CalendarToday />
            <Box mt={-1}>
              <p>{selectedYear}</p>
            </Box>

            {selectedItem && (
              <>
                <SignalCellularAlt />
                <Box mt={-1}>
                  <p>{formatDisplayNumber(selectedItem[primaryScore])}</p>
                </Box>
              </>
            )}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
export default Sidebar;
