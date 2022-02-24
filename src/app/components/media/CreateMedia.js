import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import CreateMediaDialog from './CreateMediaDialog';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';
import CreateStatusMutation from '../../relay/mutations/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
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

  submitMedia(value, status) {
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
      const media = response.createProjectMedia.project_media;
      const status_id = media.last_status_obj ? media.last_status_obj.id : '';
      const status_attr = {
        parent_type: 'project_media',
        annotated: media,
        annotation: {
          status,
          annotated_type: 'ProjectMedia',
          annotated_id: media.dbid,
          status_id,
        },
      };
      const statusSuccess = () => {
        if (getFilters() !== '{}') {
          const rid = response.createProjectMedia.project_media.dbid;
          browserHistory.push(prefix + rid);
        }
      };

      // Add or update status
      if (status_id && status_id.length) {
        Relay.Store.commitUpdate(new UpdateStatusMutation(status_attr), { onSuccess: statusSuccess, onFailure: this.fail });
      } else {
        Relay.Store.commitUpdate(new CreateStatusMutation(status_attr), { onSuccess: statusSuccess, onFailure: this.fail });
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

  handleSubmit = (value, status) => {
    this.submitMedia(value, status);
  };

  render() {
    return (
      <React.Fragment>
        <Button id="create-media__add-item" onClick={this.handleOpenDialog} color="primary" variant="contained">
          <FormattedMessage id="createMedia.addItem" defaultMessage="Add Item" />
        </Button>
        <CreateMediaDialog
          title={<FormattedMessage id="createMedia.addNewItem" defaultMessage="Add item" />}
          open={this.state.dialogOpen}
          onDismiss={this.handleCloseDialog}
          onSubmit={this.handleSubmit}
          team={this.props.team}
        />
      </React.Fragment>
    );
  }
}

CreateProjectMedia.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(CreateProjectMedia);
