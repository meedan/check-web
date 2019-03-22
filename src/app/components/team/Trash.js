import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import isEqual from 'lodash.isequal';
import TeamRoute from '../../relay/TeamRoute';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import Can from '../Can';
import CheckContext from '../../CheckContext';
import Search from '../search/Search';

const messages = defineMessages({
  title: {
    id: 'trash.title',
    defaultMessage: 'Trash',
  },
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
      confirmationError: false,
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

  handleOpen() {
    this.setState({ open: true });
  }

  handleConfirmEmptyTrash() {
    const confirmValue = document.getElementById('trash__confirm').value;
    if (confirmValue && confirmValue.toUpperCase() === 'CONFIRM') {
      this.setState({ confirmationError: false });
      this.handleClose();
      this.handleEmptyTrash();
    } else {
      this.setState({ confirmationError: true });
    }
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
          search_id: this.props.team.search_id,
          id: this.props.team.id,
        }),
        { onSuccess, onFailure },
      );
    }
  }

  render() {
    const { team } = this.props;

    const query = JSON.parse(this.props.params.query || '{}');
    query.archived = 1;

    const actions = [
      <FlatButton
        label={<FormattedMessage id="trash.cancel" defaultMessage="Cancel" />}
        primary
        onClick={this.handleClose.bind(this)}
      />,
      <RaisedButton
        label={<FormattedMessage id="trash.deleteAll" defaultMessage="Delete all" />}
        primary
        onClick={this.handleConfirmEmptyTrash.bind(this)}
      />,
    ];

    return (
      <div
        className="trash"
      >
        <Dialog
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
        >
          <h2><FormattedMessage id="trash.emptyTrash" defaultMessage="Empty trash" /></h2>
          <p>
            <FormattedMessage
              id="trash.emptyTrashConfirmationText"
              defaultMessage='Are you sure? This will permanently delete {itemsCount, plural, =0 {0 items} one {1 item} other {# items}} and {notesCount, plural, =0 {0 annotations} one {1 annotation} other {# annotations}}. Type "confirm" if you want to proceed.'
              values={{
                itemsCount: team.trash_size.project_media.toString(),
                notesCount: team.trash_size.annotation.toString(),
              }}
            />
          </p>
          <TextField
            id="trash__confirm"
            fullWidth
            errorText={
              this.state.confirmationError
                ? <FormattedMessage id="trash.confirmationError" defaultMessage="Did not match" />
                : null
            }
            hintText={<FormattedMessage id="trash.typeHere" defaultMessage="Type here" />}
          />
        </Dialog>

        <Search
          title={this.props.intl.formatMessage(messages.title)}
          team={team.slug}
          query={JSON.stringify(query)}
          fields={['status', 'sort', 'tags']}
          toolbarAddons={
            <Can permissions={team.permissions} permission="empty Trash">
              <RaisedButton
                label={<FormattedMessage id="trash.emptyTrash" defaultMessage="Empty trash" />}
                className="trash__empty-trash-button"
                primary
                onClick={this.handleOpen.bind(this)}
                disabled={this.state.emptyTrashDisabled}
              />
            </Can>
          }
        />
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
        search_id
      }
    `,
  },
});

const Trash = (props) => {
  const slug = props.params.team || '';
  const route = new TeamRoute({ teamSlug: slug });
  return (
    <Relay.RootContainer
      Component={TrashContainer}
      forceFetch
      route={route}
      renderFetched={data => <TrashContainer {...props} {...data} />}
    />
  );
};

export default injectIntl(Trash);
