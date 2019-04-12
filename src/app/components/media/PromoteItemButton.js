import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import IconButton from 'material-ui/IconButton';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import UpdateRelationshipMutation from '../../relay/mutations/UpdateRelationshipMutation';

class PromoteItemButton extends React.Component {
  handleClick = () => {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.context.setMessage);
      } else {
        this.context.setMessage(JSON.stringify(error));
      }
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
  };

  render() {
    if (this.props.hidden || this.props.media.archived) {
      return null;
    }

    return (
      <IconButton
        tooltip={
          <FormattedMessage id="mediaDetail.makeParent" defaultMessage="Promote to principal item" />
        }
        onClick={this.handleClick}
      >
        <SwapVertIcon />
      </IconButton>
    );
  }
}

PromoteItemButton.contextTypes = {
  setMessage: PropTypes.func,
};

export default PromoteItemButton;
