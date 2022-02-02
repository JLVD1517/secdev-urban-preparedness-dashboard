import React, { useState } from "react";
import { Select, FormControl, InputLabel } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

const SelectEvent: React.FC = () => {
  const useStyles = makeStyles((theme) => ({
    formControl: {
      minWidth: 250,
    },
  }));

  const [selectOption, setSelectedOption] = useState(1);

  const Options: any[] = [
    { label: "Aditya", value: 1 },
    { label: "Sanjay", value: 2 },
    { label: "Vamshi", value: 3 },
    { label: "Amit", value: 4 },
  ];

  const handleYearSelection = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedOption(event.target.value as number);
  };

  const classes = useStyles();
  return (
    <FormControl className={classes.formControl} variant="outlined">
      <InputLabel htmlFor="IndexSelect">Select Data</InputLabel>
      <Select
        id="IndexSelect"
        label="Urban Resiliency Index"
        native
        value={selectOption}
        onChange={handleYearSelection}
      >
        {Options.map((item) => {
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </Select>
    </FormControl>
  );
};
export default SelectEvent;
