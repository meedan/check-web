import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import CreateMediaDialog from './CreateMediaDialog';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';
import CreateProjectSourceMutation from '../../relay/mutations/CreateProjectSourceMutation';
import CheckContext from '../../CheckContext';
import HttpStatus from '../../HttpStatus';
import { safelyParseJSON, getFilters } from '../../helpers';

const messages = defineMessages({
  submitting: {
    id: 'createMedia.submitting',
    defaultMessage: 'Submitting...',
  },
  error: {
    id: 'createMedia.error',
    defaultMessage:
      'Something went wrong! The server returned an error code {code}. Please contact a system administrator.',
  },
  errorTitle: {
    id: 'createMedia.errorTitle',
    defaultMessage: 'Could not submit "{title}"',
  },
});

class CreateProjectMedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
      message: null,
      mode: 'link',
      isSubmitting: false,
    };
  }

  handleTabChange = (mode) => {
    this.setState({ mode });
  }

  fail(context, prefix, transactionError, title) {
    let message = this.props.intl.formatMessage(messages.error, {
      code: `${transactionError.status} ${HttpStatus.getMessage(transactionError.status)}`,
    });
    const json = safelyParseJSON(transactionError.source);
    if (json) {
      if (json.error_info && json.error_info.code === 'ERR_OBJECT_EXISTS') {
        message = null;
        context.history.push(`/${context.team.slug}/project/${json.error_info.project_id}/${json.error_info.type}/${json.error_info.id}`);
      } else {
        message = json.error;
      }
    }
    if (title) {
      message = [this.props.intl.formatMessage(messages.errorTitle, { title }), message];
      message = message.join('<br />');
    }
    this.setState({ message, isSubmitting: false });
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
      this.fail(context, prefix, transaction.getError(), value.title);
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
    if (this.state.mode === 'source') {
      this.submitSource(value);
    } else {
      this.submitMedia(value);
    }
  };

  render() {
    return (
      <div>
        <Button onClick={this.handleOpenDialog} color="primary" variant="contained">
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
};

export default injectIntl(CreateProjectMedia);
