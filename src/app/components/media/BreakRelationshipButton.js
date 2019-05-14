import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import IconButton from 'material-ui/IconButton';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import Can from '../Can';
import DeleteRelationshipMutation from '../../relay/mutations/DeleteRelationshipMutation';

class BreakRelationshipButton extends React.Component {
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

export default BreakRelationshipButton;
