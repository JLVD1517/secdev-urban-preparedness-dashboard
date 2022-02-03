import React, { useState } from "react";
import { Select, FormControl, InputLabel , Box} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const SelectGroup: React.FC = () => {
  const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 250,
    },
  }));

  const [selectOption, setSelectedOption] = useState('');

  const Options: any[] = [
    { label: "Aditya", value: 1 },
    { label: "Sanjay", value: 2 },
    { label: "Vamshi", value: 3 },
    { label: "Amit", value: 4 },
  ];

  const handleYearSelection = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedOption(event.target.value as any);
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
        <InputLabel htmlFor="IndexSelect">Select Data</InputLabel>
        <Select
          id="IndexSelect"
          label="Urban Resiliency Index"
          native
          value={selectOption}
          onChange={handleYearSelection}
        >
            <option aria-label="None" value="" />
          {Options.map((item) => {
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
export default SelectGroup;
