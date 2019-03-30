import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { injectIntl, defineMessages } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import MdCancel from 'react-icons/lib/md/cancel';
import capitalize from 'lodash.capitalize';
import LinkifyIt from 'linkify-it';
import rtlDetect from 'rtl-detect';
import SourcePicture from './SourcePicture';
import Message from '../Message';
import UploadImage from '../UploadImage';
import globalStrings from '../../globalStrings';
import CheckContext from '../../CheckContext';
import UpdateSourceMutation from '../../relay/mutations/UpdateSourceMutation';
import { updateUserNameEmail } from '../../relay/mutations/UpdateUserNameEmailMutation';
import CreateAccountSourceMutation from '../../relay/mutations/CreateAccountSourceMutation';
import DeleteAccountSourceMutation from '../../relay/mutations/DeleteAccountSourceMutation';
import { safelyParseJSON } from '../../helpers';
import {
  StyledIconButton,
  Row,
  ContentColumn,
} from '../../styles/js/shared';
import {
  StyledButtonGroup,
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledAvatarEditButton,
  StyledHelper,
} from '../../styles/js/HeaderCard';
import { stringHelper } from '../../customHelpers';

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
  userSendEmailNotification: {
    id: 'userInfoEdit.userSendEmailNotification',
    defaultMessage: 'Receive email notifications',
  },
  addLink: {
    id: 'userInfoEdit.addLink',
    defaultMessage: 'Add Link',
  },
  editError: {
    id: 'userInfoEdit.editError',
    defaultMessage: 'Sorry, an error occurred while updating your profile. Please try again and contact {supportEmail} if the condition persists.',
  },
  nameError: {
    id: 'userInfoEdit.nameError',
    defaultMessage: 'Name can\'t be blank',
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
  emailConfirmed: {
    id: 'userInfoEdit.emailConfirmed',
    defaultMessage:
      '✔ Address confirmed',
  },
  emailPendingConfirm: {
    id: 'userInfoEdit.emailPendingConfirm',
    defaultMessage:
      '⚠ Confirmation pending',
  },
  invalidLink: {
    id: 'userInfoEdit.invalidLink',
    defaultMessage: 'Please enter a valid URL',
  },
});

class UserInfoEdit extends React.Component {
  constructor(props) {
    super(props);

    let sendEmailValue = props.user.get_send_email_notifications;
    if (props.user.get_send_email_notifications == null) {
      sendEmailValue = true;
    }
    this.state = {
      submitDisabled: false,
      // TODO eslint false positive
      // eslint-disable-next-line react/no-unused-state
      image: null,
      sendEmail: sendEmailValue,
    };
  }

  onImage(file) {
    document.forms['edit-source-form'].image = file;
    // TODO eslint false positive
    // eslint-disable-next-line react/no-unused-state
    this.setState({ image: file });
  }

  onClear() {
    if (document.forms['edit-source-form']) {
      document.forms['edit-source-form'].image = null;
    }

    // TODO eslint false positive
    // eslint-disable-next-line react/no-unused-state
    this.setState({ image: null });
  }

  onImageError(file, message) {
    // TODO eslint false positive
    // eslint-disable-next-line react/no-unused-state
    this.setState({ message, image: null });
  }

  handleEditProfileImg() {
    this.setState({ editProfileImg: true });
  }

  handleLeaveEditMode() {
    const { history } = new CheckContext(this).getContextStore();
    history.push('/check/me');
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.validateUser() && this.validateLinks() && !this.state.submitDisabled) {
      this.updateSource();
      this.updateUser();
      this.updateLinks();
      this.setState({ hasFailure: false, message: null }, this.manageEditingState);
    }
  }

  handleAddLink() {
    const links = this.state.links ? this.state.links.slice(0) : [];
    const newEntry = {};
    newEntry.url = '';
    newEntry.error = '';
    links.push(newEntry);
    this.setState({ links });
  }

  handleChangeLink(e, index) {
    const links = this.state.links ? this.state.links.slice(0) : [];
    links[index].url = e.target.value;
    links[index].error = '';
    this.setState({ links });
  }

  handleRemoveLink(id) {
    const deleteLinks = this.state.deleteLinks
      ? this.state.deleteLinks.slice(0)
      : [];
    deleteLinks.push(id);
    this.setState({ deleteLinks });
  }

  handleRemoveNewLink(index) {
    const links = this.state.links ? this.state.links.slice(0) : [];
    links.splice(index, 1);
    this.setState({ links });
  }

  handleSendEmail(e, inputChecked) {
    this.setState({ sendEmail: inputChecked });
  }

  fail(transaction, mutation) {
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.editError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const json = safelyParseJSON(error.source);
    if (json && json.error) {
      message = json.error;
    }
    this.setState({ message, hasFailure: true });
    this.removePendingMutation(mutation);
  }

  success(response, mutation) {
    this.removePendingMutation(mutation);
  }

  manageEditingState = () => {
    const { pendingMutations } = this.state;
    const submitDisabled = pendingMutations ? pendingMutations.length > 0 : false;
    const isEditing = submitDisabled || this.state.hasFailure;
    const message = isEditing ? this.state.message : null;

    this.setState({ submitDisabled, message });
    if (!isEditing) {
      this.handleLeaveEditMode();
    }
  };

  registerPendingMutation(mutation) {
    const pendingMutations = this.state.pendingMutations
      ? this.state.pendingMutations.slice(0)
      : [];
    pendingMutations.push(mutation);
    this.setState({ pendingMutations });
  }

  removePendingMutation(mutation) {
    const pendingMutations = this.state.pendingMutations
      ? this.state.pendingMutations.slice(0)
      : [];
    this.setState(
      { pendingMutations: pendingMutations.filter(m => m !== mutation) },
      this.manageEditingState,
    );
  }

  updateSource() {
    const { source } = this.props.user;

    const onFailure = (transaction) => {
      this.fail(transaction, 'updateSource');
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
      this.fail(transaction, 'updateUser');
    };

    const onSuccess = (response) => {
      this.success(response, 'updateUser');
    };
    const form = document.forms['edit-source-form'];

    if (user.name === form.name.value &&
      user.email === form.email.value &&
      user.get_send_email_notifications === form.sendNotification.checked) {
      return false;
    }

    this.registerPendingMutation('updateUser');

    updateUserNameEmail(
      user.id,
      form.name.value,
      form.email.value,
      form.sendNotification.checked,
      onSuccess, onFailure,
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
        const json = safelyParseJSON(error.source);
        if (json && json.error) {
          message = json.error;
        }
        links[index].error = message;
      }

      this.setState({ hasFailure: true, submitDisabled: false });
      this.removePendingMutation('createAccount');
    };

    const onSuccess = (response) => {
      const links = this.state.links ? this.state.links.slice(0) : [];
      const index = links.findIndex(link => link.url === url);
      this.handleRemoveNewLink(index);
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
      this.fail(transaction, 'deleteAccount');
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

  validateUser() {
    const form = document.forms['edit-source-form'];
    if (!form.name.value.trim()) {
      this.setState({
        hasFailure: true,
        message: this.props.intl.formatMessage(messages.nameError),
      }, this.manageEditingState);
      return false;
    }
    return true;
  }

  validateLinks() {
    const linkify = new LinkifyIt();

    let success = true;

    let links = this.state.links ? this.state.links.slice(0) : [];
    links = links.filter(link => !!link.url.trim());

    links.forEach((item_) => {
      const item = item_;
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

  filterNonLoginAccount(as) {
    const { account } = as.node;
    return account.uid === null || account.user_id !== this.props.user.dbid;
  }

  renderAccountsEdit() {
    const { source } = this.props.user;
    const links = this.state.links ? this.state.links.slice(0) : [];
    const deleteLinks = this.state.deleteLinks
      ? this.state.deleteLinks.slice(0)
      : [];
    const showAccounts =
      source.account_sources.edges.filter(as => deleteLinks.indexOf(as.node.id) < 0);

    const showNonLoginAccount = showAccounts.filter(as => this.filterNonLoginAccount(as));

    return (
      <div key="renderAccountsEdit">
        {showNonLoginAccount.map((as, index) => (
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
                onClick={() => this.handleRemoveLink(as.node.id)}
              >
                <MdCancel />
              </StyledIconButton>
            </Row>
          </div>))}
        {links.map((link, index) => (
          <div key={index.toString()} className="source__url-input">
            <Row>
              <TextField
                id={`source__link-input${index.toString()}`}
                name={`source__link-input${index.toString()}`}
                value={link.url}
                errorText={link.error}
                floatingLabelText={this.props.intl.formatMessage(messages.addLinkLabel)}
                onChange={e => this.handleChangeLink(e, index)}
                style={{ width: '85%' }}
              />
              <StyledIconButton
                className="source__remove-link-button"
                onClick={() => this.handleRemoveNewLink(index)}
              >
                <MdCancel />
              </StyledIconButton>
            </Row>
            {link.error ?
              null :
              <StyledHelper>
                {this.props.intl.formatMessage(messages.addLinkHelper)}
              </StyledHelper>}
          </div>))}
      </div>
    );
  }

  render() {
    const { user } = this.props;
    const { source } = this.props.user;

    let emailHelperText = '';
    if (user.unconfirmed_email) {
      emailHelperText = this.props.intl.formatMessage(messages.emailPendingConfirm);
    } else if (user.email && !user.unconfirmed_email) {
      emailHelperText = this.props.intl.formatMessage(messages.emailConfirmed);
    }

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
            {!this.state.editProfileImg ?
              <StyledAvatarEditButton className="source__edit-avatar-button">
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
              {this.state.editProfileImg ?
                <UploadImage
                  onImage={this.onImage.bind(this)}
                  onClear={this.onClear.bind(this)}
                  onError={this.onImageError.bind(this)}
                  noPreview
                />
                : null}
              <TextField
                className="source__name-input"
                name="name"
                id="source__name-container"
                defaultValue={user.name}
                floatingLabelText={this.props.intl.formatMessage(messages.sourceName)}
                style={{ width: '85%' }}
              />
              <TextField
                className="source__bio-input"
                name="description"
                id="source__bio-container"
                defaultValue={source.description}
                floatingLabelText={this.props.intl.formatMessage(messages.sourceBio)}
                multiLine
                rowsMax={4}
                style={{ width: '85%' }}
              />
              <TextField
                className="source__email-input"
                name="email"
                id="source__email-container"
                defaultValue={user.unconfirmed_email || user.email}
                floatingLabelText={this.props.intl.formatMessage(messages.userEmail)}
                style={{ width: '85%' }}
              />
              <StyledHelper>
                {emailHelperText}
              </StyledHelper>
              <Checkbox
                label={this.props.intl.formatMessage(messages.userSendEmailNotification)}
                checked={this.state.sendEmail}
                onCheck={this.handleSendEmail.bind(this)}
                name="sendNotification"
              />
              {this.renderAccountsEdit()}
            </form>

            <StyledButtonGroup
              isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}
            >
              <div>
                <FlatButton
                  primary
                  onClick={this.handleAddLink.bind(this)}
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

UserInfoEdit.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserInfoEdit);
