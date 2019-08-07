import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import CreateMediaDialog from './CreateMediaDialog';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';
import CreateProjectSourceMutation from '../../relay/mutations/CreateProjectSourceMutation';
import CheckContext from '../../CheckContext';
import { stringHelper } from '../../customHelpers';
import { safelyParseJSON, getFilters } from '../../helpers';

const messages = defineMessages({
  submitting: {
    id: 'createMedia.submitting',
    defaultMessage: 'Submitting...',
  },
  error: {
    id: 'createMedia.error',
    defaultMessage:
      'Sorry, an error occurred while submitting the item. Please try again and contact {supportEmail} if the condition persists.',
  },
});

class CreateProjectMedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
      message: null,
      isSubmitting: false,
    };
  }

  fail(context, prefix, transactionError) {
    let message = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const json = safelyParseJSON(transactionError.source);
    const error = json && json.errors.length > 0 ? json.errors[0] : {};
    if (error) {
      if (error.code === 9) {
        message = null;
        context.history.push(error.data.url);
      } else {
        message = error.message; // eslint-disable-line prefer-destructuring
      }
    }
    this.context.setMessage(message);
    this.setState({ isSubmitting: false });
  }

  submitSource(value) {
    const context = new CheckContext(this).getContextStore();
    const prefix = `/${context.team.slug}/project/${context.project.dbid}/source/`;

    if (!value || this.state.isSubmitting) {
      return;
    }

    this.setState({
      isSubmitting: true,
      message: this.props.intl.formatMessage(messages.submitting),
    });

    const onFailure = (transaction) => {
      this.fail(context, prefix, transaction.getError());
    };

    const onSuccess = (response) => {
      const rid = response.createProjectSource.project_source.dbid;
      context.history.push(prefix + rid);
      this.setState({ message: null, isSubmitting: false });
    };

    Relay.Store.commitUpdate(
      new CreateProjectSourceMutation({
        ...value,
        project: context.project,
      }),
      { onSuccess, onFailure },
    );
  }

  submitMedia(value) {
    const context = new CheckContext(this).getContextStore();
    const prefix = `/${context.team.slug}/project/${context.project.dbid}/media/`;

    if (!value || this.state.isSubmitting) {
      return;
    }

    this.setState({ isSubmitting: true });

    const onFailure = (transaction) => {
      this.fail(context, prefix, transaction.getError());
    };

    const onSuccess = (response) => {
      if (getFilters() !== '{}') {
        const rid = response.createProjectMedia.project_media.dbid;
        context.history.push(prefix + rid);
      }
      this.setState({ message: null, isSubmitting: false });
    };

    this.setState({ dialogOpen: false });

    Relay.Store.commitUpdate(
      new CreateProjectMediaMutation({
        ...value,
        context,
        project: context.project,
      }),
      { onSuccess, onFailure },
    );
  }

  handleOpenDialog = () => {
    this.setState({ dialogOpen: true, message: null });
  };

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  handleSubmit = (value) => {
    if (value.mode === 'source') {
      this.submitSource(value);
    } else {
      this.submitMedia(value);
    }
  };

  render() {
    return (
      <div>
        <Button id="create-media__add-item" onClick={this.handleOpenDialog} color="primary" variant="contained">
          <FormattedMessage id="createMedia.addItem" defaultMessage="Add Item" />
        </Button>
        <CreateMediaDialog
          title={<FormattedMessage id="createMedia.addNewItem" defaultMessage="Add new item" />}
          open={this.state.dialogOpen}
          onDismiss={this.handleCloseDialog}
          message={this.state.message}
          isSubmitting={this.state.isSubmitting}
          onSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}

CreateProjectMedia.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

CreateProjectMedia.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

export default injectIntl(CreateProjectMedia);
