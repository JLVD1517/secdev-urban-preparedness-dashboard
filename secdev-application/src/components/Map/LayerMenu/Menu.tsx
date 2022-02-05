import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  FormGroup,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandMore, Layers, ExpandLess } from '@material-ui/icons';
import { setPoiState } from '../../../store/modules/sidebarControlStore';
import { AppState, PointsOfInterestStoreType } from '../../../types';
import CustomSwitch from '../../BaseUIComponents/CustomSwitch';
import { PointsOfInterest } from '../../../configuration/app-config';
import { componentSizing } from '../../../services/component-sizing';

const LayerMenu: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const mobileView = useMediaQuery(theme.breakpoints.down('sm'));

  const [openMenu, setMenuState] = useState(false);

  const pointsOfInterest: PointsOfInterestStoreType = useSelector(
    (state: AppState) => state.SidebarControl.pointsOfInterest,
  );

  const desktopCollapse: boolean = useSelector(
    (state: AppState) => state.SidebarControl.desktopCollapse,
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPoiState(event.target.name));
  };

  const menuToggle = () => {
    setMenuState(!openMenu);
  };

  const useStyles = makeStyles(theme => ({
    root: {
      position: 'absolute',
      top: `calc(${componentSizing.appBarHeight} + 1rem)`,
      backgroundColor: theme.palette.background.default,
      right: desktopCollapse
        ? `calc(${componentSizing.desktopSideBarWidthCollapse} + 25px)`
        : `calc(${componentSizing.desktopSideBarWidth} + 25px)`,
      zIndex: 200,
      display: 'flex',
      borderRadius: '16px',
      maxWidth: '210px',
      '&.button': {
        borderRadius: '16px',
        backgroundColor: theme.palette.background.default,
      },
      '&.mobile': {
        maxHeight: '200px',
        left: '10px',
        minWidth: '210px',
      },
    },
    card: {
      backgroundColor: theme.palette.background.paper,
      width: '210px',
      '&.mobile': {
        overflowY: 'auto',
      },
    },
    header: {
      fontSize: '10px',
    },
    content: {
      marginTop: '-30px',
    },
  }));
  const classes = useStyles();
  return (
    <div
      id="POIMenu"
      className={`${classes.root} ${mobileView ? 'mobile' : ''}`}
    >
      {!openMenu ? (
        <Button
          className="button"
          startIcon={<Layers />}
          endIcon={<ExpandMore />}
          onClick={menuToggle}
          disableRipple
          disableFocusRipple
        >
          POINTS OF INTEREST
        </Button>
      ) : (
        <Card className={`${classes.card} ${mobileView ? 'mobile' : ''}`}>
          <CardHeader
            className="header"
            title="Points of Interest"
            action={<ExpandLess onClick={menuToggle} />}
            titleTypographyProps={{ variant: 'body1' }}
          />
          <CardContent className={classes.content}>
            <FormControl component="fieldset">
              <FormGroup>
                {PointsOfInterest.map(item => {
                  return (
                    <Box my={1} key={item.title}>
                      <FormControlLabel
                        className="ToggleLabel"
                        label={item.title}
                        control={
                          <CustomSwitch
                            name={item.title}
                            checked={pointsOfInterest[item.title].selected}
                            onChange={handleChange}
                          />
                        }
                      />
                    </Box>
                  );
                })}
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LayerMenu;
