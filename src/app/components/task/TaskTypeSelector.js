import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import ShortTextIcon from '@material-ui/icons/ShortText';
import LocationIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import IconFileUpload from '@material-ui/icons/CloudUpload';
import MultiSelector from '../layout/MultiSelector';
import NumberIcon from '../../icons/NumberIcon';

class TaskTypeSelector extends React.Component {
  state = {};

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleSelect = (selected) => {
    this.handleClose();
    if (this.props.onSelect) {
      this.props.onSelect(selected);
    }
  };

  render() {
    const { anchorEl } = this.state;
    const options = [];
    options.push({ label: 'Short Text', value: 'free_text', icon: <ShortTextIcon /> });
    options.push({ label: 'Number', value: 'number', icon: <NumberIcon /> });
    options.push({ label: 'Location', value: 'geolocation', icon: <LocationIcon /> });
    options.push({ label: 'Datetime', value: 'datetime', icon: <DateRangeIcon /> });
    options.push({ label: 'Single Choice', value: 'single_choice', icon: <RadioButtonCheckedIcon /> });
    options.push({ label: 'Choose multiple', value: 'multiple_choice', icon: <CheckBoxIcon style={{ transform: 'scale(1,1)' }} /> });
    options.push({ label: 'File Upload', value: 'file_upload', icon: <IconFileUpload /> });

    return (
      <div>
        <Button onClick={this.handleClick} variant="outlined" fullWidth={this.props.fullWidth}>
          {this.props.selected.length ?
            <FormattedMessage
              id="taskTypeSelector.numTypes"
              defaultMessage="{length, number} selected"
              values={{ length: this.props.selected.length }}
            /> :
            <FormattedMessage id="taskTypeSelector.allTypes" defaultMessage="All tasks" />
          }
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MultiSelector
            allowToggleAll
            options={options}
            selected={this.props.selected}
            onDismiss={this.handleClose}
            onSubmit={this.handleSelect}
          />
        </Menu>
      </div>
    );
  }
}

export default TaskTypeSelector;
