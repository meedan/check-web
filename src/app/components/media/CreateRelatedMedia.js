import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import styled from 'styled-components';
import Can from '../Can';
import Message from '../Message';
import { safelyParseJSON } from '../../helpers';
import { units, black05 } from '../../styles/js/shared';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';

const StyledCreateRelatedClaimButton = styled(FlatButton)`
  margin-bottom: ${units(2)} !important;

  &:hover {
    background-color: ${black05} !important;
  }
`;

const messages = defineMessages({
  newClaim: {
    id: 'createRelatedMedia.newClaim',
    defaultMessage: 'Add a related claim',
  },
});

class CreateRelatedMedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
      message: null,
      submitDisabled: true,
    };
  }

  handleOpenDialog() {
    this.setState({
      dialogOpen: true,
      submitDisabled: true,
    });
  }

  handleCloseDialog() {
    this.setState({ dialogOpen: false });
  }

  handleChange() {
    if (document.getElementById('claim-input').value.trim() !== '' && document.getElementById('source-input').value.trim() !== '') {
      this.setState({ submitDisabled: false });
    } else {
      this.setState({ submitDisabled: true });
    }
  }

  handleSubmit() {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      this.setState({ message });
    };

    const onSuccess = () => {
      document.getElementById('claim-input').value = '';
      document.getElementById('source-input').value = '';
      this.setState({
        dialogOpen: false,
        message: null,
      });
    };

    if (!this.state.submitDisabled) {
      const quote = document.getElementById('claim-input').value.trim();
      const quoteAttributions = JSON.stringify({ name: document.getElementById('source-input').value.trim() });

      Relay.Store.commitUpdate(
        new CreateProjectMediaMutation({
          url: '',
          quote,
          quoteAttributions,
          image: '',
          project: this.props.media.project,
          related: this.props.media,
          related_to_id: this.props.media.dbid,
          targets_count: this.props.media.relationships.targets_count,
          relationships_target_id: this.props.media.relationships.target_id,
          relationships_source_id: this.props.media.relationships.source_id,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ submitDisabled: true });
    }
  }

  render() {
    const { media } = this.props;

    if (media.archived) {
      return null;
    }

    const actions = [
      <FlatButton
        label={<FormattedMessage id="createRelatedMedia.cancelAdd" defaultMessage="Cancel" />}
        onClick={this.handleCloseDialog.bind(this)}
      />,
      <FlatButton
        className="create-related-media__dialog-submit-button"
        label={<FormattedMessage id="createRelatedMedia.submit" defaultMessage="Submit" />}
        primary
        keyboardFocused
        onClick={this.handleSubmit.bind(this)}
        disabled={this.state.submitDisabled}
      />,
    ];

    return (
      <div>
        {media.relationships.sources_count === 0 ?
          <Can permissions={media.project.permissions} permission="create Media">
            <StyledCreateRelatedClaimButton
              className="create-related-media__add-button create-related-media__add-button--default"
              onClick={this.handleOpenDialog.bind(this)}
              label={<FormattedMessage id="createRelatedMedia.addRelatedItem" defaultMessage="Add related item" />}
            />
          </Can> : null}

        <Dialog
          title={this.props.intl.formatMessage(messages.newClaim)}
          className="create-related-media__dialog"
          actionsContainerClassName="create-related-media__action-container"
          actions={actions}
          modal={false}
          open={this.state.dialogOpen}
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          <Message message={this.state.message} />

          <TextField
            id="claim-input"
            className="create-related-media__input"
            fullWidth
            onChange={this.handleChange.bind(this)}
            floatingLabelText={
              <FormattedMessage id="createRelatedMedia.claimText" defaultMessage="Claim text" />
            }
            multiLine
          />

          <TextField
            id="source-input"
            className="create-related-media__input"
            fullWidth
            onChange={this.handleChange.bind(this)}
            floatingLabelText={
              <FormattedMessage id="createRelatedMedia.source" defaultMessage="Source" />
            }
            multiLine
          />

        </Dialog>
      </div>
    );
  }
}

export default injectIntl(CreateRelatedMedia);
