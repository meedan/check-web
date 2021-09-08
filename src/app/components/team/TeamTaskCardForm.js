import React from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';

const TeamTaskCardForm = ({ task }) => (
  <Box mx={2} mb={2}>
    {task.options.map(o => (
      <Box display="flex" alignItems="center" p={1}>
        { task.type === 'single_choice' ? <RadioButtonUncheckedIcon /> : null}
        { task.type === 'multiple_choice' ? <CheckBoxOutlineBlankIcon /> : null}
        <Box ml={2}>
          {o.label}
        </Box>
      </Box>
    ))}
    { task.type === 'free_text' ?
      <TextField
        variant="outlined"
        fullWidth
        disabled
      /> : null
    }
  </Box>
);

export default TeamTaskCardForm;
