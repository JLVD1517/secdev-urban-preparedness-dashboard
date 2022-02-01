import React, { useState } from 'react';
import { useTheme, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import TextField from '@material-ui/core/TextField';
import DateRangeIcon from '@material-ui/icons/DateRange';
import moment from 'moment';
import DateRangePicker from 'react-daterange-picker';
import 'react-daterange-picker/dist/css/react-calendar.css';
import './DateRangeFilter.scss';
// import { MapGradientType } from '../../types';

interface DateRangeFilterProps {
  darkTheme: boolean;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ darkTheme }) => {
  const theme = useTheme();
  const useStyles = makeStyles((theme: Theme) => ({
    root: {
      position: 'relative',
    },
  }));
  const [value, onSelect]: any = useState(null);
  const [modal, setModal]: any = useState<Boolean>(false);

  const classes = useStyles();
  return (
    <div className="dateRange">
      <TextField
        id="outlined-read-only-input"
        label="Start-End Date Range"
        InputProps={{
          readOnly: true,
          endAdornment: <DateRangeIcon />
        }}
        variant="outlined"
        placeholder="Date Range"
        value={value && value.start ? `${moment(value?.start).format('DD MMM YYYY')} - ${moment(
          value?.end,
        ).format('DD MMM YYYY')}`:''}
        onClick={() => setModal(!modal)}
      />
      {modal && (
        <div>
          <DateRangePicker
            selectionType="range"
            value={value}
            onSelect={(value: any) => {
              onSelect(value);
              setModal(!modal);
            }}
            numberOfCalendars={2}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
