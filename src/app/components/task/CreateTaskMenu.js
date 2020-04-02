import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MdShortText from 'react-icons/lib/md/short-text';
import MdRadioButtonChecked from 'react-icons/lib/md/radio-button-checked';
import MdCheckBox from 'react-icons/lib/md/check-box';
import MdLocationOn from 'react-icons/lib/md/location-on';
import MdDateRange from 'react-icons/lib/md/date-range';
import MdGrade from 'react-icons/lib/md/grade';
import IconImageUpload from '@material-ui/icons/CloudUpload';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { units, black05 } from '../../styles/js/shared';

const StyledCreateTaskButton = styled(Button)`
  margin-bottom: ${units(2)} !important;

  &:hover {
    background-color: ${black05} !important;
  }
`;

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
    return (
      <div>
        <StyledCreateTaskButton
          className="create-task__add-button"
          onClick={this.handleClick.bind(this)}
        >
          <FormattedMessage id="tasks.addTask" defaultMessage="Add task" />
        </StyledCreateTaskButton>

        <Menu
          open={this.state.menuOpen}
          anchorEl={this.state.anchorEl}
          onClose={this.handleRequestClose.bind(this)}
        >
          <MenuItem
            className="create-task__add-short-answer"
            onClick={() => this.handleSelectType('free_text')}
          >
            <ListItemIcon><MdShortText /></ListItemIcon>
            <ListItemText
              primary={
                <FormattedMessage id="tasks.shortAnswer" defaultMessage="Short answer" />
              }
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-choose-one"
            onClick={() => this.handleSelectType('single_choice')}
          >
            <ListItemIcon><MdRadioButtonChecked /></ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="tasks.chooseOne" defaultMessage="Choose one" />}
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-choose-multiple"
            onClick={() => this.handleSelectType('multiple_choice')}
          >
            <ListItemIcon><MdCheckBox style={{ transform: 'scale(1,1)' }} /></ListItemIcon>
            <ListItemText
              primary={
                <FormattedMessage id="tasks.chooseMultiple" defaultMessage="Choose multiple" />
              }
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-geolocation"
            onClick={() => this.handleSelectType('geolocation')}
          >
            <ListItemIcon><MdLocationOn /></ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="tasks.geolocation" defaultMessage="Location" />}
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-datetime"
            onClick={() => this.handleSelectType('datetime')}
          >
            <ListItemIcon><MdDateRange /></ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="tasks.datetime" defaultMessage="Date and time" />}
            />
          </MenuItem>
          <MenuItem
            className="create-task__add-image-upload"
            onClick={() => this.handleSelectType('image_upload')}
          >
            <ListItemIcon><IconImageUpload /></ListItemIcon>
            <ListItemText
              primary={<FormattedMessage id="tasks.imageUpload" defaultMessage="Image upload" />}
            />
          </MenuItem>
          {config.appName === 'check' && !this.props.hideTeamwideOption ?
            <MenuItem
              className="create-task__teamwide-nudge"
              onClick={() => this.handleSelectType('teamwide')}
            >
              <ListItemIcon><MdGrade /></ListItemIcon>
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
