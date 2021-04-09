import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ShortTextIcon from '@material-ui/icons/ShortText';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import GradeIcon from '@material-ui/icons/Grade';
import IconFileUpload from '@material-ui/icons/CloudUpload';
import NumberIcon from '../../icons/NumberIcon';

class CreateTaskMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = { menuOpen: false };
  }

  handleClick(event) {
    this.setState({
      menuOpen: true,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose() {
    this.setState({ menuOpen: false });
  }

  handleSelectType = (type) => {
    this.setState({ menuOpen: false });

    if (this.props.onSelect) {
      this.props.onSelect(type);
    }
  };

  render() {
    const isTask = this.props.fieldset === 'tasks';
    const { teamSettings } = this.props;
    const buttonProps = {};

    if (teamSettings) {
      buttonProps.color = 'primary';
      buttonProps.variant = 'contained';
    }

    return (
      <div>
        <Button
          className="create-task__add-button"
          onClick={this.handleClick.bind(this)}
          {...buttonProps}
        >
          { isTask ?
            <FormattedMessage id="tasks.addTask" defaultMessage="New task" /> :
            <FormattedMessage id="tasks.addMetadata" defaultMessage="New metadata" />
          }
        </Button>

        <Menu
          open={this.state.menuOpen}
          anchorEl={this.state.anchorEl}
          onClose={this.handleRequestClose.bind(this)}
        >
          <MenuItem
            className="create-task__add-short-answer"
            onClick={() => this.handleSelectType('free_text')}
          >
            <ListItemIcon><ShortTextIcon /></ListItemIcon>
            <ListItemText
              primary={
                <FormattedMessage id="tasks.shortAnswer" defaultMessage="Text" />
              }
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-number"
            onClick={() => this.handleSelectType('number')}
          >
            <ListItemIcon><NumberIcon /></ListItemIcon>
            <ListItemText
              primary={
                <FormattedMessage id="tasks.number" defaultMessage="Number" />
              }
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-choose-one"
            onClick={() => this.handleSelectType('single_choice')}
          >
            <ListItemIcon><RadioButtonCheckedIcon /></ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="tasks.chooseOne" defaultMessage="Single select" />}
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-choose-multiple"
            onClick={() => this.handleSelectType('multiple_choice')}
          >
            <ListItemIcon><CheckBoxIcon style={{ transform: 'scale(1,1)' }} /></ListItemIcon>
            <ListItemText
              primary={
                <FormattedMessage id="tasks.chooseMultiple" defaultMessage="Multiple select" />
              }
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-geolocation"
            onClick={() => this.handleSelectType('geolocation')}
          >
            <ListItemIcon><LocationOnIcon /></ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="tasks.geolocation" defaultMessage="Location" />}
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-datetime"
            onClick={() => this.handleSelectType('datetime')}
          >
            <ListItemIcon><DateRangeIcon /></ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="tasks.datetime" defaultMessage="Date and time" />}
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-file-upload"
            onClick={() => this.handleSelectType('file_upload')}
          >
            <ListItemIcon><IconFileUpload /></ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="tasks.fileUpload" defaultMessage="File upload" />}
            />
          </MenuItem>
          { !this.props.teamSettings && isTask ?
            <MenuItem
              className="create-task__teamwide-nudge"
              onClick={() => this.handleSelectType('teamwide')}
            >
              <ListItemIcon><GradeIcon /></ListItemIcon>
              <ListItemText
                primary={<FormattedMessage id="tasks.teamwideNudge" defaultMessage="Default tasks" />}
              />
            </MenuItem> : null
          }
        </Menu>
      </div>
    );
  }
}

export default CreateTaskMenu;
