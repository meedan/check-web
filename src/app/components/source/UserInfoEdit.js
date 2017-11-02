import React from 'react';
import Relay from 'react-relay';
import { injectIntl, defineMessages } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import MdCancel from 'react-icons/lib/md/cancel';
import capitalize from 'lodash.capitalize';
import LinkifyIt from 'linkify-it';
import rtlDetect from 'rtl-detect';
import SourcePicture from './SourcePicture';
import Message from '../Message';
import UploadImage from '../UploadImage';
import globalStrings from '../../globalStrings';
import UpdateSourceMutation from '../../relay/UpdateSourceMutation';
import UpdateUserNameEmailMutation from '../../relay/mutation/UpdateUserNameEmailMutation';
import CreateAccountSourceMutation from '../../relay/mutation/CreateAccountSourceMutation';
import DeleteAccountSourceMutation from '../../relay/mutation/DeleteAccountSourceMutation';
import { StyledIconButton, Row, ContentColumn } from '../../styles/js/shared';

import {
  StyledButtonGroup,
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledAvatarEditButton,
  StyledHelper,
} from '../../styles/js/HeaderCard';

const messages = defineMessages({
  sourceName: {
    id: 'userInfoEdit.sourceName',
    defaultMessage: 'Name',
  },
  sourceBio: {
    id: 'userInfoEdit.sourceBio',
    defaultMessage: 'Bio',
  },
  userEmail: {
    id: 'userInfoEdit.userEmail',
    defaultMessage: 'Email',
  },
  addLink: {
    id: 'userInfoEdit.addLink',
    defaultMessage: 'Add Link',
  },
  editError: {
    id: 'userInfoEdit.editError',
    defaultMessage: 'Sorry, could not edit the source',
  },
  addLinkLabel: {
    id: 'userInfoEdit.addLinkLabel',
    defaultMessage: 'Add a link',
  },
  addLinkHelper: {
    id: 'userInfoEdit.addLinkHelper',
    defaultMessage:
      'Add a link to a web page or social media profile. Note: this does not affect your login method.',
  },
  invalidLink: {
    id: 'userInfoEdit.invalidLink',
    defaultMessage: 'Please enter a valid URL',
  },
});

class UserInfoEdit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitDisabled: false,
    };
  }

  handleEditProfileImg = () => {
    this.setState({ editProfileImg: true });
  };

  handleLeaveEditMode = () => {
    this.onClear();
    this.props.onCancelEdit();
  };

  onImage(file) {
    document.forms['edit-source-form'].image = file;
    this.setState({ image: file });
  }

  onClear = () => {
    if (document.forms['edit-source-form']) {
      document.forms['edit-source-form'].image = null;
    }

    this.setState({ image: null });
  };

  onImageError(file, message) {
    this.setState({ message, image: null });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.validateLinks() && !this.state.submitDisabled) {
      const updateSourceSent = this.updateSource();
      const updateUserSent = this.updateUser();
      const updateLinksSent = this.updateLinks();

      this.setState({ submitDisabled: true, hasFailure: false, message: null });
    }
  }

  handleAddLink = () => {
    const links = this.state.links ? this.state.links.slice(0) : [];
    const newEntry = {};
    newEntry.url = '';
    newEntry.error = '';
    links.push(newEntry);
    this.setState({ links, menuOpen: false });
  };

  handleChangeLink(e, index) {
    const links = this.state.links ? this.state.links.slice(0) : [];
    links[index].url = e.target.value;
    links[index].error = '';
    this.setState({ links });
  }

  handleRemoveLink = (id) => {
    const deleteLinks = this.state.deleteLinks
      ? this.state.deleteLinks.slice(0)
      : [];
    deleteLinks.push(id);
    this.setState({ deleteLinks });
  };

  handleRemoveNewLink = (index) => {
    const links = this.state.links ? this.state.links.slice(0) : [];
    links.splice(index, 1);
    this.setState({ links });
  };

  fail = (transaction) => {
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.editError);
    try {
      const json = JSON.parse(error.source);
      if (json.error) {
        message = json.error;
      }
    } catch (e) {}
    this.setState({ message, hasFailure: true, submitDisabled: false });
  };

  success = (response, mutation) => {
    const manageEditingState = () => {
      const submitDisabled = this.state.pendingMutations.length > 0;
      const isEditing = submitDisabled || this.state.hasFailure;
      const message = isEditing ? this.state.message : null;

      this.setState({ submitDisabled, message });
      if (!isEditing) {
        this.handleLeaveEditMode();
      }
    };

    const pendingMutations = this.state.pendingMutations
      ? this.state.pendingMutations.slice(0)
      : [];
    this.setState(
      { pendingMutations: pendingMutations.filter(m => m !== mutation) },
      manageEditingState,
    );
  };

  registerPendingMutation = (mutation) => {
    const pendingMutations = this.state.pendingMutations
      ? this.state.pendingMutations.slice(0)
      : [];
    pendingMutations.push(mutation);
    this.setState({ pendingMutations });
  };

  updateSource() {
    const { source } = this.props.user;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.editError);

      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}

      this.setState({ message, submitDisabled: false });
    };

    const onSuccess = (response) => {
      this.success(response, 'updateSource');
    };
    const form = document.forms['edit-source-form'];

    if (source.description === form.description.value && !form.image) {
      return false;
    }

    this.registerPendingMutation('updateSource');

    Relay.Store.commitUpdate(
      new UpdateSourceMutation({
        source: {
          id: source.id,
          image: form.image,
          description: form.description.value,
        },
      }),
      { onSuccess, onFailure },
    );

    return true;
  }

  updateUser() {
    const { user } = this.props;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.editError);

      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}

      this.setState({ message, submitDisabled: false });
    };

    const onSuccess = (response) => {
      this.success(response, 'updateUser');
    };
    const form = document.forms['edit-source-form'];

    if (user.name === form.name.value && user.email === form.email.value) {
      return false;
    }

    this.registerPendingMutation('updateUser');

    Relay.Store.commitUpdate(
      new UpdateUserNameEmailMutation({
        id: user.id,
        name: form.name.value,
        email: form.email.value,
      }),
      { onSuccess, onFailure },
    );

    return true;
  }

  updateLinks() {
    let links = this.state.links ? this.state.links.slice(0) : [];
    links = links.filter(link => !!link.url.trim());

    const deleteLinks = this.state.deleteLinks
      ? this.state.deleteLinks.slice(0)
      : [];

    if (!links.length && !deleteLinks.length) {
      return false;
    }

    links.forEach((link) => {
      this.createAccountSource(link.url);
    });
    deleteLinks.forEach((id) => {
      this.deleteAccountSource(id);
    });

    return true;
  }

  createAccountSource(url) {
    const { source } = this.props.user;

    const onFailure = (transaction) => {
      const links = this.state.links ? this.state.links.slice(0) : [];
      const index = links.findIndex(link => link.url === url);

      if (index > -1) {
        const error = transaction.getError();
        let message = this.props.intl.formatMessage(messages.invalidLink);
        try {
          const json = JSON.parse(error.source);
          if (json.error) {
            message = json.error;
          }
        } catch (e) {}

        links[index].error = message;
      }

      this.setState({ hasFailure: true, submitDisabled: false });
    };

    const onSuccess = (response) => {
      this.success(response, 'createAccount');
    };

    if (!url) {
      return;
    }

    this.registerPendingMutation('createAccount');

    Relay.Store.commitUpdate(
      new CreateAccountSourceMutation({
        id: source.dbid,
        url,
        source,
      }),
      { onSuccess, onFailure },
    );
  }

  deleteAccountSource(asId) {
    const { source } = this.props.user;
    const onFailure = (transaction) => {
      this.fail(transaction);
    };
    const onSuccess = (response) => {
      this.success(response, 'deleteAccount');
    };

    this.registerPendingMutation('deleteAccount');

    Relay.Store.commitUpdate(
      new DeleteAccountSourceMutation({
        id: asId,
        source,
      }),
      { onSuccess, onFailure },
    );
  }

  validateLinks() {
    const linkify = new LinkifyIt();

    let success = true;

    let links = this.state.links ? this.state.links.slice(0) : [];
    links = links.filter(link => !!link.url.trim());

    links.forEach((item) => {
      const url = linkify.match(item.url);
      if (Array.isArray(url) && url[0] && url[0].url) {
        item.url = url[0].url;
      } else {
        item.error = this.props.intl.formatMessage(messages.invalidLink);
        success = false;
      }
    });

    this.setState({ links, submitDisabled: false });
    return success;
  }

  renderAccountsEdit() {
    const { source } = this.props.user;
    const links = this.state.links ? this.state.links.slice(0) : [];
    const deleteLinks = this.state.deleteLinks
      ? this.state.deleteLinks.slice(0)
      : [];
    const showAccounts = source.account_sources.edges.filter(
      as => deleteLinks.indexOf(as.node.id) < 0,
    );

    return (
      <div key="renderAccountsEdit">
        {showAccounts.map((as, index) =>
          <div key={as.node.id} className="source__url">
            <Row>
              <TextField
                id={`source__link-item${index.toString()}`}
                defaultValue={as.node.account.url}
                floatingLabelText={capitalize(as.node.account.provider)}
                style={{ width: '85%' }}
                disabled
              />
              <StyledIconButton
                className="source__remove-link-button"
                onClick={() => this.handleRemoveLink(as.node.id)}>
                <MdCancel />
              </StyledIconButton>
            </Row>
          </div>,
        )}
        {links.map((link, index) =>
          <div key={index.toString()} className="source__url-input">
            <Row>
              <TextField
                id={`source__link-input${index.toString()}`}
                name={`source__link-input${index.toString()}`}
                value={link.url}
                errorText={link.error}
                floatingLabelText={this.props.intl.formatMessage(
                  messages.addLinkLabel,
                )}
                onChange={e => this.handleChangeLink(e, index)}
                style={{ width: '85%' }}
              />
              <StyledIconButton
                className="source__remove-link-button"
                onClick={() => this.handleRemoveNewLink(index)}>
                <MdCancel />
              </StyledIconButton>
            </Row>
            {link.error
              ? null
              : <StyledHelper>
                {this.props.intl.formatMessage(messages.addLinkHelper)}
              </StyledHelper>}
          </div>,
        )}
      </div>
    );
  }

  render() {
    const { user } = this.props;
    const { source } = this.props.user;

    return (
      <ContentColumn noPadding>
        <Message message={this.state.message} />
        <StyledTwoColumns>
          <StyledSmallColumn
            isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}
          >
            <SourcePicture
              size="large"
              object={source}
              type="user"
              className="source__avatar"
            />
            {!this.state.editProfileImg
              ? <StyledAvatarEditButton className="source__edit-avatar-button">
                <FlatButton
                  label={this.props.intl.formatMessage(globalStrings.edit)}
                  onClick={this.handleEditProfileImg.bind(this)}
                  primary
                />
              </StyledAvatarEditButton>
              : null}
          </StyledSmallColumn>

          <StyledBigColumn>
            <form
              onSubmit={this.handleSubmit.bind(this)}
              name="edit-source-form"
            >
              {this.state.editProfileImg
                ? <UploadImage
                  onImage={this.onImage.bind(this)}
                  onClear={this.onClear}
                  onError={this.onImageError.bind(this)}
                  noPreview
                />
                : null}
              <TextField
                className="source__name-input"
                name="name"
                id="source__name-container"
                defaultValue={user.name}
                floatingLabelText={this.props.intl.formatMessage(
                  messages.sourceName,
                )}
                style={{ width: '85%' }}
              />
              <TextField
                className="source__bio-input"
                name="description"
                id="source__bio-container"
                defaultValue={source.description}
                floatingLabelText={this.props.intl.formatMessage(
                  messages.sourceBio,
                )}
                multiLine
                rowsMax={4}
                style={{ width: '85%' }}
              />
              <TextField
                className="source__email-input"
                name="email"
                id="source__email-container"
                defaultValue={user.email}
                floatingLabelText={this.props.intl.formatMessage(
                  messages.userEmail,
                )}
                style={{ width: '85%' }}
              />

              {this.renderAccountsEdit()}
            </form>

            <StyledButtonGroup
              isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}
            >
              <div>
                <FlatButton
                  primary
                  onClick={this.handleAddLink}
                  label={this.props.intl.formatMessage(messages.addLink)}
                />
              </div>

              <div className="source__edit-buttons-cancel-save">
                <FlatButton
                  className="source__edit-cancel-button"
                  onClick={this.handleLeaveEditMode.bind(this)}
                  label={this.props.intl.formatMessage(globalStrings.cancel)}
                />
                <RaisedButton
                  className="source__edit-save-button"
                  primary
                  onClick={this.handleSubmit.bind(this)}
                  label={this.props.intl.formatMessage(globalStrings.save)}
                />
              </div>
            </StyledButtonGroup>
          </StyledBigColumn>
        </StyledTwoColumns>
      </ContentColumn>
    );
  }
}

export default injectIntl(UserInfoEdit);
