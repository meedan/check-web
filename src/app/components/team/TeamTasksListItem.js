import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import ShortTextIcon from '@material-ui/icons/ShortText';
import LocationIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { RequiredIndicator } from '../task/Task';

const TeamTasksListItem = (props) => {
  const icon = {
    free_text: <ShortTextIcon />,
    geolocation: <LocationIcon />,
    datetime: <DateRangeIcon />,
    single_choice: <RadioButtonCheckedIcon />,
    multiple_choice: <CheckBoxIcon />,
  };

  const label = (
    <span>
      {props.task.label}
      <RequiredIndicator required={props.task.required} />
    </span>
  );


  return (
    <ListItem>
      <ListItemIcon>
        {icon[props.task.type]}
      </ListItemIcon>
      <ListItemText primary={label} />
      <ListItemSecondaryAction>
        <IconButton>
          <MoreHorizIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};


export default TeamTasksListItem;
