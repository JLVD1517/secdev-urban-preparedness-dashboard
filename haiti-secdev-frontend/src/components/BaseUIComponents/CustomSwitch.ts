import { Switch } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/styles';
import { Theme, darken } from '@material-ui/core/styles';

// Customizing the styling of switch components using Material-UI withStyles function
export default withStyles((theme: Theme) =>
  createStyles({
    switchBase: {
      color: 'white !important',
      '&$checked': {
        '&:hover': {
          backgroundColor: `${theme.palette.primary.main}33`,
        },
        color: `${darken(`${theme.palette.primary.main}`, 0.2)}!important`,
      },
      '&:hover': {
        backgroundColor: `${theme.palette.background.paper}33`,
      },
      '&$checked + $track': {
        backgroundColor: `${theme.palette.secondary.main} !important`,
        color: `${theme.palette.primary.main} !important`,
      },
    },
    checked: {},
    track: {
      backgroundColor: theme.palette.action.disabled,
    },
  }),
)(Switch);
