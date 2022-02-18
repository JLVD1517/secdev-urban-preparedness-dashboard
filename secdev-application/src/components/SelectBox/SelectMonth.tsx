import React, { useEffect } from 'react';
import { Select, FormControl, InputLabel, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../types";
import { setSelectedMonth } from '../../store/modules/sidebarControlStore';
import { availableMonths } from '../../configuration/app-config';

interface MarksType {
    value: number;
    label: number;
  }

const SelectMonth: React.FC = () => {
  const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 250,
    },
  }));

  const dispatch = useDispatch();

  const selectedMonth: number | number[] = useSelector(
    (state: AppState) => state.SidebarControl.selectedMonth,
  );

  const [value, setValue] = React.useState<number | number[]>(selectedMonth);
  const [marks, setMarks] = React.useState<MarksType[]>([]);
 

  useEffect(
    () => {
      const lastMonth = availableMonths[availableMonths.length - 1].value;
      const newMarks: MarksType[] = [];

      // set the slider and store value to the last available date
      setValue(lastMonth);
      dispatch(setSelectedMonth(lastMonth));

      // set the marks in state
      setMarks(availableMonths);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableMonths],
  );
  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: number | number[],
  ) => {
    setValue(newValue);
  };
  const classes = useStyles();
  return (
    <Box
      my={3}
      mx="auto"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <FormControl className={classes.formControl} variant="outlined">
        <InputLabel htmlFor="IndexSelect">Select Month</InputLabel>
        <Select
          id="IndexSelect"
          label="Urban Resiliency Index"
          native
        //   value={}
        //   onChange={handleChange}
        >
            {(availableMonths as []).map((item:any, index: number) => {
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
        </Select>
      </FormControl>
    </Box>
  );
};
export default SelectMonth;
