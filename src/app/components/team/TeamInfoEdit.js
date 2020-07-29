import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Relay from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import TeamAvatar from './TeamAvatar';
import Message from '../Message';
import UploadFile from '../UploadFile';
import { FormattedGlobalMessage } from '../MappedMessage';
import { getErrorMessage, validateURL } from '../../helpers';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import {
  StyledButtonGroup,
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledAvatarEditButton,
} from '../../styles/js/HeaderCard';
import { units } from '../../styles/js/shared';
import { stringHelper } from '../../customHelpers';

class TeamInfoEdit extends React.Component {
  constructor(props) {
    super(props);

    const { team } = this.props;
    const contact = team.contacts.edges[0] || { node: {} };
    this.state = {
      avatar: null,
      message: null,
      editProfileImg: false,
      submitDisabled: false,
      values: {
        name: team.name,
        description: team.description,
        contact_location: contact.node.location,
        contact_phone: contact.node.phone,
        contact_web: contact.node.web,
      },
    };
  }

  handleImageChange = (file) => {
    this.setState({ avatar: file, message: null });
  }

  handleImageError = (file, message) => {
    this.setState({ avatar: null, message });
  }

  handleEditProfileImg() {
    this.setState({ editProfileImg: true });
  }

  handleLeaveEditMode() {
    browserHistory.push(`/${this.props.team.slug}`);
  }

  handleChange(key, e) {
    const value = (e.target.type === 'checkbox' && !e.target.checked) ? '0' : e.target.value;
    const values = Object.assign({}, this.state.values);

    if (key === 'contact_web') {
      const urlError = null;
      this.setState({ urlError });
    }

    values[key] = value;
    this.setState({ values });
  }

  handleSubmit() {
    const onFailure = (transaction) => {
      const fallbackMessage = (
        <FormattedMessage
          id="teamComponent.editError"
          defaultMessage="Sorry, an error occurred while updating the workspace. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message, avatar: null, submitDisabled: false });
    };

    const onSuccess = () => {
      this.setState({
        message: null,
        avatar: null,
        submitDisabled: false,
      });
      this.handleLeaveEditMode();
    };

    const { values, avatar } = this.state;

    if (!this.state.submitDisabled) {
      Relay.Store.commitUpdate(
        new UpdateTeamMutation({
          name: values.name,
          description: values.description,
          contact: JSON.stringify({
            location: values.contact_location,
            phone: values.contact_phone,
            web: values.contact_web,
          }),
          id: this.props.team.id,
          public_id: this.props.team.public_team_id,
          avatar,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ submitDisabled: true });
    }
  }

  validateWebsite(e) {
    let urlError = null;
    const url = e.target.value;

    if (url.trim() && !validateURL(url)) {
      // TODO nix this derived state. Instead, only store "user is editing URL"
      urlError = (
        <FormattedMessage
          id="teamComponent.invalidLink"
          defaultMessage="Please enter a valid URL"
        />
      );
    }

    this.setState({ urlError, submitDisabled: !!urlError });
  }

  render() {
    const { team } = this.props;
    const contact = team.contacts.edges[0] || { node: {} };

    const avatarPreview = this.state.avatar && this.state.avatar.preview;

    return (
      <form onSubmit={this.handleSubmit.bind(this)} name="edit-team-form">
        <Message message={this.state.message} />
        <StyledTwoColumns>
          <StyledSmallColumn>
            <TeamAvatar
              style={{ backgroundImage: `url(${avatarPreview || team.avatar})` }}
              size={units(9)}
              team={team}
            />
            {!this.state.editProfileImg ?
              <StyledAvatarEditButton className="team__edit-avatar-button">
                <Button
                  color="primary"
                  onClick={this.handleEditProfileImg.bind(this)}
                >
                  <FormattedGlobalMessage messageKey="edit" />
                </Button>
              </StyledAvatarEditButton>
              : null}
          </StyledSmallColumn>

          <StyledBigColumn>
            {this.state.editProfileImg ?
              <UploadFile
                type="image"
                value={this.state.avatar}
                onChange={this.handleImageChange}
                onError={this.handleImageError}
                noPreview
              />
              : null}

            <TextField
              className="team__name-input"
              id="team__name-container"
              defaultValue={team.name}
              label={<FormattedMessage id="teamComponent.teamName" defaultMessage="Name" />}
              onChange={this.handleChange.bind(this, 'name')}
              margin="normal"
              fullWidth
            />

            <TextField
              className="team__description"
              id="team__description-container"
              defaultValue={team.description}
              label={
                <FormattedMessage id="teamComponent.teamDescription" defaultMessage="Description" />
              }
              onChange={this.handleChange.bind(this, 'description')}
              fullWidth
              rows={1}
              rowsMax={4}
              margin="normal"
            />

            <TextField
              className="team__location"
              id="team__location-container"
              defaultValue={contact ? contact.node.location : ''}
              label={<FormattedMessage id="teamComponent.location" defaultMessage="Location" />}
              onChange={this.handleChange.bind(this, 'contact_location')}
              fullWidth
              margin="normal"
            />

            <TextField
              className="team__phone"
              id="team__phone-container"
              defaultValue={contact ? contact.node.phone : ''}
              label={<FormattedMessage id="teamComponent.phone" defaultMessage="Phone number" />}
              onChange={this.handleChange.bind(this, 'contact_phone')}
              fullWidth
              margin="normal"
            />

            <TextField
              className="team__location-name-input"
              id="team__link-container"
              defaultValue={contact ? contact.node.web : ''}
              label={<FormattedMessage id="teamComponent.website" defaultMessage="Website" />}
              onBlur={this.validateWebsite.bind(this)}
              onChange={this.handleChange.bind(this, 'contact_web')}
              fullWidth
              margin="normal"
              error={!!this.state.urlError}
              helperText={this.state.urlError}
            />

            <StyledButtonGroup>
              <div className="source__edit-buttons-cancel-save">
                <Button
                  className="source__edit-cancel-button"
                  onClick={this.handleLeaveEditMode.bind(this)}
                >
                  <FormattedMessage
                    id="teamComponent.cancelButton"
                    defaultMessage="Cancel"
                  />
                </Button>

                <Button
                  className="source__edit-save-button"
                  variant="contained"
                  color="primary"
                  onClick={this.handleSubmit.bind(this)}
                >
                  <FormattedMessage
                    id="teamComponent.saveButton"
                    defaultMessage="Save"
                  />
                </Button>
              </div>
            </StyledButtonGroup>
          </StyledBigColumn>
        </StyledTwoColumns>
      </form>
    );
  }
}

export default TeamInfoEdit;
