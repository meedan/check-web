import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import isEqual from 'lodash.isequal';
import ConfirmDialog from '../layout/ConfirmDialog';
import TeamRoute from '../../relay/TeamRoute';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import Can from '../Can';
import CheckContext from '../../CheckContext';

const messages = defineMessages({
  refresh: {
    id: 'trash.refresh',
    defaultMessage: 'Refresh now',
  },
});

class TrashComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emptyTrashDisabled: false,
      open: false,
    };
  }

  componentDidMount() {
    this.setContextTeam();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState) ||
    !isEqual(this.props, nextProps);
  }

  componentDidUpdate() {
    this.setContextTeam();
  }

  getContext() {
    return new CheckContext(this);
  }

  setContextTeam() {
    const context = this.getContext();
    const currentContext = this.currentContext();

    if (!currentContext.team || currentContext.team.slug !== this.props.team.slug) {
      context.setContextStore({ team: this.props.team });
    }
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  handleMessage(message) {
    this.context.setMessage(message);
  }

  handleRefresh() {
    this.props.relay.forceFetch();
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
    const message = (
      <FormattedMessage
        id="trash.emptyInProgress"
        defaultMessage="Empty trash operation is in progress. Please check back later. {refresh}"
        values={{
          refresh: (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <span
              onClick={this.handleRefresh.bind(this)}
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              {this.props.intl.formatMessage(messages.refresh)}
            </span>
          ),
        }}
      />
    );

    if (this.state.emptyTrashDisabled) {
      this.handleMessage(message);
    } else {
      this.setState({ emptyTrashDisabled: true });

      const onFailure = (transaction) => {
        const transactionError = transaction.getError();
        if (transactionError.json) {
          transactionError.json().then(this.handleMessage);
        } else {
          this.handleMessage(JSON.stringify(transactionError));
        }
        this.setState({ emptyTrashDisabled: false });
      };

      const onSuccess = () => {
        this.handleMessage(message);
      };

      Relay.Store.commitUpdate(
        new UpdateTeamMutation({
          empty_trash: 1,
          search_id: this.props.search.id,
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
            defaultMessage="Are you sure? This will permanently delete {itemsCount, plural, =0 {0 items} one {1 item} other {# items}} and {notesCount, plural, =0 {0 annotations} one {1 annotation} other {# annotations}}."
            values={{
              itemsCount: team.trash_size.project_media.toString(),
              notesCount: team.trash_size.annotation.toString(),
            }}
          />}
          handleClose={this.handleClose.bind(this)}
          handleConfirm={this.handleConfirmEmptyTrash.bind(this)}
        />

        <Can permissions={team.permissions} permission="empty Trash">
          <RaisedButton
            label={<FormattedMessage id="trash.emptyTrash" defaultMessage="Empty trash" />}
            className="trash__empty-trash-button"
            primary
            onClick={this.handleOpen}
            disabled={this.state.emptyTrashDisabled || number_of_results === 0}
          />
        </Can>
      </div>
    );
  }
}

TrashComponent.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

TrashComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

const TrashContainer = Relay.createContainer(TrashComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        slug
        permissions
        trash_size
      }
    `,
  },
});

const Trash = (props) => {
  const slug = props.teamSlug || '';
  const route = new TeamRoute({ teamSlug: slug });
  return (
    <Relay.RootContainer
      Component={TrashContainer}
      route={route}
      renderFetched={data => <TrashContainer {...props} {...data} />}
      forceFetch
    />
  );
};

export default injectIntl(Trash);
