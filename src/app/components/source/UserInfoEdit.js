import React from 'react';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import LinkifyIt from 'linkify-it';
import cx from 'classnames/bind';
import Alert from '../cds/alerts-and-prompts/Alert';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import TextField from '../cds/inputs/TextField';
import SourcePicture from './SourcePicture';
import UploadFile from '../UploadFile';
import UpdateSourceMutation from '../../relay/mutations/UpdateSourceMutation';
import { updateUserNameEmail } from '../../relay/mutations/UpdateUserNameEmailMutation';
import CreateAccountSourceMutation from '../../relay/mutations/CreateAccountSourceMutation';
import DeleteAccountSourceMutation from '../../relay/mutations/DeleteAccountSourceMutation';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import styles from './User.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

const messages = defineMessages({
  sourceName: {
    id: 'userInfoEdit.sourceName',
    defaultMessage: 'Name',
  },
  userEmail: {
    id: 'userInfoEdit.userEmail',
    defaultMessage: 'Email',
  },
  emailHint: {
    id: 'userInfoEdit.emailInputHint',
    defaultMessage: 'email@example.com',
    description: 'Text field input help text about the format of an email address',
  },
  userSendEmailNotification: {
    id: 'userInfoEdit.userSendEmailNotification',
    defaultMessage: 'Receive email notifications',
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

function handleLeaveEditMode() {
  browserHistory.push('/check/me');
}

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

  handleImageChange = (file) => {
    this.setState({ image: file });
  }

  handleImageError = (file, message) => {
    this.setState({ message, image: null });
  }

  handleEditProfileImg() {
    this.setState({ editProfileImg: true });
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

  handleSendEmail(inputChecked) {
    this.setState({ sendEmail: inputChecked });
  }

  fail(transaction, mutation) {
    const fallbackMessage = this.props.intl.formatMessage(messages.editError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const message = getErrorMessage(transaction, fallbackMessage);
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
      handleLeaveEditMode();
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

    if (!this.state.image) {
      return false;
    }

    this.registerPendingMutation('updateSource');

    Relay.Store.commitUpdate(
      new UpdateSourceMutation({
        source: {
          id: source.id,
          image: this.state.image,
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
        const fallbackMessage = this.props.intl.formatMessage(messages.invalidLink);
        const message = getErrorMessage(transaction, fallbackMessage);
        links[index].error = message;
      }

      this.setState({ links, hasFailure: true, submitDisabled: false });
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
      <>
        { this.state.message &&
          <Alert
            content={this.state.message}
            variant="error"
          />
        }
        <div className={styles['user-info-wrapper']}>
          <div className={styles['user-info-avatar']}>
            <SourcePicture
              size="large"
              object={source}
              type="user"
              className="source__avatar"
            />
            {!this.state.editProfileImg ?
              <ButtonMain
                className={styles.StyledAvatarEditButton}
                theme="brand"
                variant="text"
                size="default"
                onClick={this.handleEditProfileImg.bind(this)}
                label={
                  <FormattedMessage id="global.edit" defaultMessage="Edit" description="Generic label for a button or link for a user to press when they wish to edit content or functionality" />
                }
              />
              : null}
          </div>

          <div className={styles['user-info-primary']}>
            <form
              onSubmit={this.handleSubmit.bind(this)}
              name="edit-source-form"
            >
              <div className={inputStyles['form-fieldset']}>
                {this.state.editProfileImg ?
                  <UploadFile
                    type="image"
                    value={this.state.image}
                    onChange={this.handleImageChange}
                    onError={this.handleImageError}
                    noPreview
                  />
                  : null}
                <TextField
                  required
                  componentProps={{
                    id: 'source__name-container',
                    name: 'name',
                  }}
                  className={cx('source__name-input', inputStyles['form-fieldset-field'])}
                  defaultValue={user.name}
                  label={this.props.intl.formatMessage(messages.sourceName)}
                />
                <TextField
                  componentProps={{
                    id: 'source__email-container',
                    name: 'email',
                  }}
                  className={cx('source__email-input', inputStyles['form-fieldset-field'])}
                  defaultValue={user.unconfirmed_email || user.email}
                  label={this.props.intl.formatMessage(messages.userEmail)}
                  placeholder={
                    this.props.intl.formatMessage(messages.emailHint)
                  }
                  helpContent={emailHelperText}
                />
                <SwitchComponent
                  className={inputStyles['form-fieldset-field']}
                  checked={Boolean(this.state.sendEmail)}
                  onChange={this.handleSendEmail.bind(this, Boolean(!this.state.sendEmail))}
                  label={this.props.intl.formatMessage(messages.userSendEmailNotification)}
                  labelPlacement="end"
                  inputProps={{
                    name: 'sendNotification',
                  }}
                />
              </div>
            </form>
            <div className={cx('source__edit-buttons-cancel-save', inputStyles['form-footer-actions'])}>
              <ButtonMain
                className="source__edit-cancel-button"
                size="default"
                variant="text"
                theme="lightText"
                onClick={handleLeaveEditMode}
                label={
                  <FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />
                }
              />
              <ButtonMain
                className="source__edit-save-button"
                size="default"
                variant="contained"
                theme="brand"
                onClick={this.handleSubmit.bind(this)}
                label={
                  <FormattedMessage id="global.save" defaultMessage="Save" description="Generic label for a button or link for a user to press when they wish to save an action or setting" />
                }
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default injectIntl(UserInfoEdit);
