import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import rtlDetect from 'rtl-detect';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import TeamAvatar from './TeamAvatar';
import Message from '../Message';
import UploadImage from '../UploadImage';
import globalStrings from '../../globalStrings';
import { getErrorMessage, validateURL } from '../../helpers';
import CheckContext from '../../CheckContext';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import {
  StyledButtonGroup,
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledAvatarEditButton,
} from '../../styles/js/HeaderCard';
import {
  units,
} from '../../styles/js/shared';
import { stringHelper } from '../../customHelpers';

const messages = defineMessages({
  editError: {
    id: 'teamComponent.editError',
    defaultMessage: 'Sorry, an error occurred while updating the workspace. Please try again and contact {supportEmail} if the condition persists.',
  },
  teamName: {
    id: 'teamComponent.teamName',
    defaultMessage: 'Name',
  },
  teamDescription: {
    id: 'teamComponent.teamDescription',
    defaultMessage: 'Description',
  },
  location: {
    id: 'teamComponent.location',
    defaultMessage: 'Location',
  },
  phone: {
    id: 'teamComponent.phone',
    defaultMessage: 'Phone number',
  },
  website: {
    id: 'teamComponent.website',
    defaultMessage: 'Website',
  },
  invalidLink: {
    id: 'teamComponent.invalidLink',
    defaultMessage: 'Please enter a valid URL',
  },
});

class TeamInfoEdit extends React.Component {
  constructor(props) {
    super(props);

    const { team } = this.props;
    const contact = team.contacts.edges[0] || { node: {} };
    this.state = {
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

  onImage(file) {
    document.forms['edit-team-form'].avatar = file;
    this.setState({ message: null, avatar: file });
  }

  onClear() {
    if (document.forms['edit-team-form']) {
      document.forms['edit-team-form'].avatar = null;
    }
    this.setState({ message: null, avatar: null });
  }

  onImageError(file, message) {
    this.setState({ message, avatar: null });
  }

  handleEditProfileImg() {
    this.setState({ editProfileImg: true });
  }

  handleLeaveEditMode() {
    const { history } = new CheckContext(this).getContextStore();
    history.push(`/${this.props.team.slug}`);
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
      const fallbackMessage = this.props.intl.formatMessage(messages.editError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
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

    const { values } = this.state;
    const form = document.forms['edit-team-form'];

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
          avatar: form.avatar,
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
      urlError = this.props.intl.formatMessage(messages.invalidLink);
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
                  {this.props.intl.formatMessage(globalStrings.edit)}
                </Button>
              </StyledAvatarEditButton>
              : null}
          </StyledSmallColumn>

          <StyledBigColumn>
            {this.state.editProfileImg ?
              <UploadImage
                type="image"
                onImage={this.onImage.bind(this)}
                onClear={this.onClear.bind(this)}
                onError={this.onImageError.bind(this)}
                noPreview
              />
              : null}

            <TextField
              className="team__name-input"
              id="team__name-container"
              defaultValue={team.name}
              label={this.props.intl.formatMessage(messages.teamName)}
              onChange={this.handleChange.bind(this, 'name')}
              margin="normal"
              fullWidth
            />

            <TextField
              className="team__description"
              id="team__description-container"
              defaultValue={team.description}
              label={
                this.props.intl.formatMessage(messages.teamDescription)
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
              label={this.props.intl.formatMessage(messages.location)}
              onChange={this.handleChange.bind(this, 'contact_location')}
              fullWidth
              margin="normal"
            />

            <TextField
              className="team__phone"
              id="team__phone-container"
              defaultValue={contact ? contact.node.phone : ''}
              label={this.props.intl.formatMessage(messages.phone)}
              onChange={this.handleChange.bind(this, 'contact_phone')}
              fullWidth
              margin="normal"
            />

            <TextField
              className="team__location-name-input"
              id="team__link-container"
              defaultValue={contact ? contact.node.web : ''}
              label={this.props.intl.formatMessage(messages.website)}
              onBlur={this.validateWebsite.bind(this)}
              onChange={this.handleChange.bind(this, 'contact_web')}
              fullWidth
              margin="normal"
              error={!!this.state.urlError}
              helperText={this.state.urlError}
            />

            <StyledButtonGroup
              isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}
            >
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

TeamInfoEdit.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

TeamInfoEdit.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(TeamInfoEdit);
