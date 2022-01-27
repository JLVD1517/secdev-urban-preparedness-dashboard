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
            <h1 className={classes.SectionHeader}>Los Angeles</h1>
            <h2 className={classes.IntroHeader}>
              Pandemic Preparedness and Recovery Dashboard
            </h2>
            <Typography variant="body1" gutterBottom>
              The urban pandemic preparedness and recovery dashboard is designed
              to improve city situational awareness, planning and coordination.
              By mapping out health risks, social and economic vulnerabilities
              and digital preparedness, it can help city executives, planners
              and operational teams with accurate information on at-risk
              population groups.{' '}
            </Typography>
            <Typography variant="body1" gutterBottom>
              This demo uses open source data from Los Angeles, California.{' '}
              <br />
              To find out how to deploy your own UPPD, reach out to{' '}
              <Link
                href="https://www.secdev.com/"
                aria-label="the SecDev Group homepage"
              >
                the SecDev Group
              </Link>{' '}
              for more details.
            </Typography>
            <Button
              variant="outlined"
              className={classes.Button}
              component={RouterLink}
              fullWidth
              to="/map"
              aria-label="go to map"
            >
              Go To Map
            </Button>
            <h2 className={classes.SectionHeader}>About</h2>
            <Typography variant="body1" gutterBottom>
              The platform was designed by{' '}
              <Link
                href="https://www.secdev.com/"
                aria-label="Link to the SecDev Group homepage"
              >
                the SecDev Group
              </Link>{' '}
              with support from{' '}
              <Link
                href="https://www.rs21.io/#!/"
                aria-label="Link to the RS21 homepage"
              >
                RS21
              </Link>
              ,{' '}
              <Link
                href="https://mapbox.com/community/"
                aria-label="Link to the Mapbox Community page"
              >
                Mapbox Community
              </Link>
              , Georgetown University and the CDC, as well as city networks such
              as the C40, Metropolis, Global Resilient Cities Network, Mayors
              Migration Council and the Global Parliament of Mayors. The
              dashboard was financially supported by the Hilton Foundation, Open
              Society Foundation and Walder Foundation.
            </Typography>
            <Partners />
          </Grid>
        </Grid>
      </Container>
    </InfoPageContainer>
  );
};

export default About;
