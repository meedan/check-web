import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import IconButton from 'material-ui/IconButton';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import Can from '../Can';
import { stringHelper } from '../../customHelpers';
import DeleteRelationshipMutation from '../../relay/mutations/DeleteRelationshipMutation';

const messages = defineMessages({
  error: {
    id: 'breakRelationship.error',
    defaultMessage: 'Sorry, an error occurred while updating the relationship. Please try again and contact {supportEmail} if the condition persists.',
  },
});

class BreakRelationshipButton extends React.Component {
  handleClick = () => {
    const onFailure = () => {
      const message = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      this.context.setMessage(message);
    };

    const { id, source, target } = this.props.media.relationship;

    Relay.Store.commitUpdate(
      new DeleteRelationshipMutation({
        id,
        source,
        target,
        media: this.props.media,
        current: this.props.currentRelatedMedia,
      }),
      { onFailure },
    );
  };

  render() {
    if (this.props.hidden || this.props.media.archived) {
      return null;
    }

    return (
      <Can permissions={this.props.media.relationship.permissions} permission="destroy Relationship">
        <IconButton
          tooltip={
            <FormattedMessage id="mediaDetail.breakRelationship" defaultMessage="Break relationship" />
          }
          onClick={this.handleClick}
        >
          <LayersClearIcon />
        </IconButton>
      </Can>
    );
  }
}

BreakRelationshipButton.contextTypes = {
  setMessage: PropTypes.func,
};

export default injectIntl(BreakRelationshipButton);
