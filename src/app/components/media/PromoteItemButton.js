import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import IconButton from 'material-ui/IconButton';
import TransformIcon from '@material-ui/icons/Transform';
import Can from '../Can';
import { stringHelper } from '../../customHelpers';
import UpdateRelationshipMutation from '../../relay/mutations/UpdateRelationshipMutation';

class PromoteItemButton extends React.Component {
  handleClick = () => {
    const onFailure = () => {
      const message = (
        <FormattedMessage
          id="promoteItemButton.error"
          defaultMessage="Sorry, an error occurred while updating the relationship. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      this.context.setMessage(message);
    };

    const { id, source, target } = this.props.media.relationship;

    Relay.Store.commitUpdate(
      new UpdateRelationshipMutation({
        id,
        source,
        target,
        current: this.props.currentRelatedMedia || this.props.media,
        media: this.props.media,
      }),
      { onFailure },
    );

    if (/\/project\/[0-9-]+\/media\/[0-9]+$/.test(window.location.pathname)) {
      const currentMediaId = window.location.pathname.match(/[0-9]+$/)[0];
      if (target.dbid !== parseInt(currentMediaId, 10)) {
        const path = window.location.pathname.replace(/[0-9]+$/, target.dbid);
        window.setTimeout(() => { this.context.router.push(path); }, 1000);
      }
    }
  };

  render() {
    if (this.props.hidden || this.props.media.archived) {
      return null;
    }

    return (
      <Can permissions={this.props.media.relationship.permissions} permission="update Relationship">
        <IconButton
          tooltip={
            <FormattedMessage id="mediaDetail.makeParent" defaultMessage="Promote to principal item" />
          }
          onClick={this.handleClick}
        >
          <TransformIcon />
        </IconButton>
      </Can>
    );
  }
}

PromoteItemButton.contextTypes = {
  setMessage: PropTypes.func,
  router: PropTypes.object,
};

export default PromoteItemButton;
