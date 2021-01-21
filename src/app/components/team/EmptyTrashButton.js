import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { injectIntl, FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import isEqual from 'lodash.isequal';
import ConfirmDialog from '../layout/ConfirmDialog';
import TeamRoute from '../../relay/TeamRoute';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import Can from '../Can';
import { getErrorMessage } from '../../helpers';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';

class EmptyTrashComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emptyTrashDisabled: false,
      open: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState) ||
    !isEqual(this.props, nextProps);
  }

  handleClose() {
    this.setState({ open: false });
  }

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleConfirmEmptyTrash() {
    this.handleClose();
    this.handleEmptyTrash();
  }

  handleEmptyTrash() {
    if (!this.state.emptyTrashDisabled) {
      this.setState({ emptyTrashDisabled: true });

      const onFailure = (transaction) => {
        const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
        const message = getErrorMessage(transaction, fallbackMessage);
        this.setState({ emptyTrashDisabled: false });
        this.props.setFlashMessage(message);
      };

      const onSuccess = () => {
      };

      Relay.Store.commitUpdate(
        new UpdateTeamMutation({
          empty_trash: 1,
          search_id: this.props.search.id,
          public_id: this.props.team.public_team.id,
          id: this.props.team.id,
        }),
        { onSuccess, onFailure },
      );
    }
  }

  render() {
    const { team, search: { number_of_results } } = this.props;

    return (
      <div className="empty-trash-button">
        <ConfirmDialog
          message={this.state.message}
          open={this.state.open}
          title={<FormattedMessage id="trash.emptyTrash" defaultMessage="Empty trash" />}
          blurb={<FormattedMessage
            id="trash.emptyTrashConfirmationText"
            defaultMessage="Are you sure? This will permanently delete {itemsCount, plural, one {# item} other {# items}} and {notesCount, plural, one {# annotation} other {# annotations}}."
            values={{
              itemsCount: team.trash_size.project_media.toString(),
              notesCount: team.trash_size.annotation.toString(),
            }}
          />}
          handleClose={this.handleClose.bind(this)}
          handleConfirm={this.handleConfirmEmptyTrash.bind(this)}
        />

        <Can permissions={team.permissions} permission="empty Trash">
          <Button
            variant="contained"
            color="primary"
            className="trash__empty-trash-button"
            onClick={this.handleOpen}
            disabled={this.state.emptyTrashDisabled || number_of_results === 0}
          >
            <FormattedMessage id="trash.emptyTrash" defaultMessage="Empty trash" />
          </Button>
        </Can>
      </div>
    );
  }
}

EmptyTrashComponent.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

EmptyTrashComponent.contextTypes = {
  store: PropTypes.object,
};

const EmptyTrashContainer = Relay.createContainer(EmptyTrashComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        slug
        permissions
        trash_size
        public_team {
          id
          trash_count
        }
      }
    `,
  },
});

const EmptyTrashButton = (props) => {
  const slug = props.teamSlug || '';
  const route = new TeamRoute({ teamSlug: slug });
  return (
    <Relay.RootContainer
      Component={EmptyTrashContainer}
      route={route}
      renderFetched={data => <EmptyTrashContainer {...props} {...data} />}
    />
  );
};

export default withSetFlashMessage(injectIntl(EmptyTrashButton));
