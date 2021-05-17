import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import CreateMediaDialog from './CreateMediaDialog';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';
import { stringHelper } from '../../customHelpers';
import { getErrorObjects, getFilters } from '../../helpers';
import CheckError from '../../CheckError';
import { withSetFlashMessage } from '../FlashMessage';

class CreateProjectMedia extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
    };
  }

  fail = (transaction) => {
    let message = (
      <FormattedMessage
        id="createMedia.error"
        defaultMessage="Sorry, an error occurred while submitting the item. Please try again and contact {supportEmail} if the condition persists."
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const error = getErrorObjects(transaction);
    if (Array.isArray(error) && error.length > 0) {
      if (error[0].code === CheckError.codes.DUPLICATED) {
        browserHistory.push(error[0].data.url);
      }
      message = error[0].message; // eslint-disable-line prefer-destructuring
    }
    this.props.setFlashMessage(message, 'error');
  };

  submitMedia(value) {
    let prefix = null;
    if (this.props.project) {
      prefix = `/${this.props.team.slug}/project/${this.props.project.dbid}/media/`;
    } else {
      prefix = `/${this.props.team.slug}/media/`;
    }

    if (!value) {
      return;
    }

    const onSuccess = (response) => {
      if (getFilters() !== '{}') {
        const rid = response.createProjectMedia.project_media.dbid;
        browserHistory.push(prefix + rid);
      }
    };

    this.setState({ dialogOpen: false });

    Relay.Store.commitUpdate(
      new CreateProjectMediaMutation({
        ...value,
        team: this.props.team,
        search: this.props.search,
        project: this.props.project,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  handleOpenDialog = () => {
    this.setState({ dialogOpen: true });
  };

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  handleSubmit = (value) => {
    this.submitMedia(value);
  };

  render() {
    return (
      <React.Fragment>
        <Button id="create-media__add-item" onClick={this.handleOpenDialog} color="primary" variant="contained">
          <FormattedMessage id="createMedia.addItem" defaultMessage="Add Item" />
        </Button>
        <CreateMediaDialog
          title={<FormattedMessage id="createMedia.addNewItem" defaultMessage="Add new item" />}
          open={this.state.dialogOpen}
          onDismiss={this.handleCloseDialog}
          onSubmit={this.handleSubmit}
        />
      </React.Fragment>
    );
  }
}

CreateProjectMedia.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(CreateProjectMedia);
