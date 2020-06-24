import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import CreateRelatedMediaDialog from './CreateRelatedMediaDialog';
import Can from '../Can';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';
import { black05 } from '../../styles/js/shared';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';

const StyledCreateRelatedClaimButton = styled(Button)`
  &:hover {
    background-color: ${black05} !important;
  }
`;

class CreateRelatedMedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
      message: null,
      isSubmitting: false,
    };
  }

  handleOpenDialog() {
    this.setState({ dialogOpen: true, message: null });
  }

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  currentProject() {
    let project = null;
    let currentProjectId = window.location.pathname.match(/project\/([0-9]+)/);
    if (currentProjectId) {
      currentProjectId = parseInt(currentProjectId[1], 10);
      project = this.props.media.projects.edges.filter(p =>
        parseInt(p.node.dbid, 10) === currentProjectId);
      if (project.length) {
        project = project[0].node;
      }
    }
    return project;
  }

  handleSubmit = (value) => {
    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message, isSubmitting: false, dialogOpen: true });
    };

    const onSuccess = () => {
      this.setState({ message: null, isSubmitting: false });
    };

    const context = new CheckContext(this).getContextStore();

    Relay.Store.commitUpdate(
      new CreateProjectMediaMutation({
        ...value,
        context,
        project: this.currentProject(),
        team: this.props.media.team,
        related: this.props.media,
        related_to_id: this.props.media.dbid,
        targets_count: this.props.media.relationships.targets_count,
        relationships_target_id: this.props.media.relationships.target_id,
        relationships_source_id: this.props.media.relationships.source_id,
      }),
      { onSuccess, onFailure },
    );

    this.setState({ isSubmitting: true, dialogOpen: false });
  };

  handleSubmitExisting = (obj) => {
    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message, isSubmitting: false, dialogOpen: true });
    };

    const onSuccess = () => {
      this.setState({ message: null, isSubmitting: false });
    };

    const context = new CheckContext(this).getContextStore();

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        obj,
        context,
        id: obj.id,
        project: this.currentProject(),
        related_to: this.props.media,
        related_to_id: this.props.media.dbid,
        relationships_target_id: this.props.media.relationships.target_id,
        relationships_source_id: this.props.media.relationships.source_id,
      }),
      { onSuccess, onFailure },
    );

    this.setState({ isSubmitting: true, dialogOpen: false });
  };

  render() {
    const { media } = this.props;

    if (media.archived) {
      return null;
    }

    return (
      <div>
        {media.relationships.sources_count === 0 ?
          <Can permissions={media.team.permissions} permission="create ProjectMedia">
            <StyledCreateRelatedClaimButton
              className="create-related-media__add-button create-related-media__add-button--default"
              onClick={this.handleOpenDialog.bind(this)}
            >
              <FormattedMessage id="createRelatedMedia.addRelatedItem" defaultMessage="Add related item" />
            </StyledCreateRelatedClaimButton>
          </Can> : null}

        <CreateRelatedMediaDialog
          title={<FormattedMessage id="createRelatedMedia.addRelatedItem" defaultMessage="Add related item" />}
          open={this.state.dialogOpen}
          onDismiss={this.handleCloseDialog}
          onSubmit={this.handleSubmit}
          onSelect={this.handleSubmitExisting}
          media={media}
          message={this.state.message}
          isSubmitting={this.state.isSubmitting}
        />
      </div>
    );
  }
}

CreateRelatedMedia.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(CreateRelatedMedia);
