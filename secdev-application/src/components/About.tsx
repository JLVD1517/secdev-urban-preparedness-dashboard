import React from 'react';
import { Container, Grid, Theme, Typography, Button } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import { createStyles, makeStyles } from '@material-ui/styles';
import { useSelector } from 'react-redux';
import { AboutBackgroundImage } from '../configuration/img-config';
import { componentSizing } from '../services/component-sizing';
import InfoPageContainer from './BaseUIComponents/InfoPageContainer';
import { AppState } from '../types';
import Partners from './Partners';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    AboutContainer: {
      minHeight: `calc(100vh - ${componentSizing.appBarHeight})`,
      padding: '5rem 0',
    },
    SectionHeader: {
      marginTop: '1rem',
    },
    IntroHeader: {
      marginTop: '0.5rem',
    },
    Button: {
      marginTop: '1rem',
      marginBottom: '1rem',
      fontSize: '20px',
    },
  }),
);

export const About: React.FC = () => {
  const classes = useStyles();

  const darkTheme: boolean = useSelector(
    (state: AppState) => state.AppControl.darkTheme,
  );

  return (
    <InfoPageContainer image={AboutBackgroundImage}>
      <Container>
        <Grid container spacing={1} className={classes.AboutContainer}>
          <Grid item xs={12} md={6}>
            <h1 className={classes.SectionHeader}>Port Au Prince</h1>
            <h2 className={classes.IntroHeader}>
            Community violence reduction monitor
            </h2>
            <Typography variant="body1" gutterBottom>
            The community violence reduction monitor is an interactive dashboard designed 
            to improve situational awareness in Port-au-Prince, Haiti. <br/>
            The platform has two basic functions: <br/>
            <ul>
            <li>visualizing patterns of crime and victimization from English and French media sources and</li>
            <li>mapping the influence of armed groups across the metropolitan area. </li>  
            </ul>
            Users can interact with the map and filters to track the scope, scale and 
            dynamics of community violence over time.{' '}
            </Typography>
            <Button
              variant="outlined"
              className={classes.Button}
              component={RouterLink}
              fullWidth
              to="/groups"
              aria-label="go to group"
            >
              View Group Map
            </Button>
            <h2 className={classes.SectionHeader}>About</h2>
            <Typography variant="body1" gutterBottom>
            The community violence reduction monitor was designed and developed by{' '}
              <Link
                href="https://www.secdev.com/"
                aria-label="Link to the SecDev Group homepage"
              >
                the SecDev Group
              </Link>{' '} 
            in partnership with the UN Population Fund (UNFPA). 
            The interactive platform benefits from the support of MapBox and shapefiles are retrieved from OCHA. 
            Events data is drawn from public open sources and group data is derived from local analyst input. 
            The dashboard is intended to help the United Nations (UN), 
            Haitian authorities and civil society groups improve data-driven and 
            evidence-based community violence reduction strategies. 
            </Typography>
            <Partners />
          </Grid>
        </Grid>
      </Container>
    </InfoPageContainer>
  );
};

export default About;
