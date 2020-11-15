import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import CreateRelatedMediaDialog from './CreateRelatedMediaDialog';
import Can from '../Can';
import CheckContext from '../../CheckContext';
import { getErrorMessage, getCurrentProject } from '../../helpers';
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
        project: getCurrentProject(this.props.media.team.projects),
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
      if (this.props.reverse) {
        window.location.reload();
      }
    };

    const context = new CheckContext(this).getContextStore();

    let source = this.props.media;
    let target = obj;
    if (this.props.reverse) {
      source = obj;
      target = this.props.media;
    }

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        obj: target,
        context,
        id: target.id,
        project: source.team ? getCurrentProject(source.team.projects) : null,
        related_to: source,
        related_to_id: source.dbid,
        relationships_target_id: source.relationships.target_id,
        relationships_source_id: source.relationships.source_id,
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

    let label = <FormattedMessage id="createRelatedMedia.addSecondaryItem" defaultMessage="Add secondary item" />;
    if (this.props.reverse) {
      label = <FormattedMessage id="createRelatedMedia.addToPrimaryItem" defaultMessage="Add to primary item" />;
    }

    return (
      <div>
        {media.relationships.sources_count === 0 ?
          <Can permissions={media.team.permissions} permission="create ProjectMedia">
            <StyledCreateRelatedClaimButton
              className="create-related-media__add-button create-related-media__add-button--default"
              onClick={this.handleOpenDialog.bind(this)}
              variant="outlined"
            >
              {label}
            </StyledCreateRelatedClaimButton>
          </Can> : null}

        <CreateRelatedMediaDialog
          title={label}
          open={this.state.dialogOpen}
          onDismiss={this.handleCloseDialog}
          onSubmit={this.handleSubmit}
          onSelect={this.handleSubmitExisting}
          media={media}
          message={this.state.message}
          isSubmitting={this.state.isSubmitting}
          hideNew={this.props.reverse}
          reverse={this.props.reverse}
        />
      </div>
    );
  }
}

CreateRelatedMedia.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(CreateRelatedMedia);
