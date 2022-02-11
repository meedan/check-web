/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Chip from '@material-ui/core/Chip';
import styled from 'styled-components';
import isEqual from 'lodash.isequal';
import TeamRoute from '../../relay/TeamRoute';
import CheckContext from '../../CheckContext';
import { StyledTagsWrapper, units } from '../../styles/js/shared';

class AttributionComponent extends React.Component {
  static resize() {
    // https://github.com/callemall/material-ui/issues/5793#issuecomment-282306001
    window.dispatchEvent(new Event('resize'));
  }

  constructor(props) {
    super(props);

    const selectedUsers = [];
    const selectedUserIds = [];
    props.selectedUsers.forEach((user) => {
      selectedUserIds.push(user.node.dbid);
      selectedUsers.push({ value: user.node.dbid, label: user.node.name });
    });

    const unselectedUsers = [];
    props.team.team_users.edges.forEach((team_user) => {
      const { node } = team_user;
      if (node.status === 'member') {
        const { user } = node;

        let shouldDisplay = true;

        if (user.is_bot) {
          shouldDisplay = false;
        }

        if (props.taskType && user.is_bot) {
          shouldDisplay = false;
          const regexp = new RegExp(props.taskType);
          user.bot_events.split(',').forEach((ev) => {
            if (regexp.test(ev)) {
              shouldDisplay = true;
            }
          });
        }

        if (selectedUserIds.indexOf(user.dbid) === -1 && shouldDisplay) {
          unselectedUsers.push({ value: user.dbid, label: user.name });
        }
      }
    });

    this.state = {
      selectedUsers,
      unselectedUsers,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  componentDidMount() {
    AttributionComponent.resize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState) ||
    !isEqual(this.props, nextProps);
  }

  // eslint-disable-next-line class-methods-use-this
  componentDidUpdate() {
    AttributionComponent.resize();
  }

  handleChange(value) {
    let selectedUsers = this.state.selectedUsers.slice(0);
    const unselectedUsers = [];

    if (this.props.multi) {
      selectedUsers.push(value);
    } else {
      if (selectedUsers.length > 0) {
        unselectedUsers.push(selectedUsers[0]);
      }
      selectedUsers = [value];
    }

    this.state.unselectedUsers.forEach((user) => {
      if (user.value !== value.value) {
        unselectedUsers.push(user);
      }
    });

    this.setState({ selectedUsers, unselectedUsers });

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  handleDelete(value) {
    const unselectedUsers = this.state.unselectedUsers.slice(0);
    const selectedUsers = [];
    unselectedUsers.push(value);
    this.state.selectedUsers.forEach((user) => {
      if (user.value !== value.value) {
        selectedUsers.push(user);
      }
    });

    this.setState({ selectedUsers, unselectedUsers });

    if (this.props.onChange) {
      this.props.onChange({ value: 0 });
    }
  }

  render() {
    const { id } = this.props;

    const StyledSelect = styled(Select)`
      margin-bottom: 200px;

      .Select-control {
        border-left: 0;
        border-right: 0;
        border-top: 0;
        border-radius: 0;
      }
    `;

    const selectedUserIds = [];
    this.state.selectedUsers.forEach((user) => {
      selectedUserIds.push(user.value);
    });
    const value = selectedUserIds.join(',');

    return (
      <div id="attribution">
        <form name={`edit-task-attribution-${id}`}>

          <input type="hidden" value={value} name="selected-user-ids" id={`attribution-${id}`} />

          <div style={{ marginTop: units(4), marginBottom: units(4) }}>
            <StyledTagsWrapper className="attribution__selected-users">
              {this.state.selectedUsers.map(user => (
                <Chip
                  key={user.value}
                  className="attribution__selected-user"
                  onDelete={() => this.handleDelete(user)}
                  label={user.label}
                />))
              }
            </StyledTagsWrapper>
          </div>

          <StyledSelect
            options={this.state.unselectedUsers}
            onChange={this.handleChange.bind(this)}
            noResultsText={<FormattedMessage id="attribution.noResults" defaultMessage="No results" />}
            placeholder={<FormattedMessage id="attribution.search" defaultMessage="Search members" />}
          />
        </form>
      </div>
    );
  }
}

const AttributionContainer = Relay.createContainer(injectIntl(AttributionComponent), {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        team_users(first: 10000) {
          edges {
            node {
              id
              status
              user {
                id
                dbid
                name
                is_active
                is_bot
                bot_events
              }
            }
          }
        }
      }
    `,
  },
});

const Attribution = (props, context) => {
  const contextStore = new CheckContext().getContextStore(context.store);
  const route = new TeamRoute({ teamSlug: contextStore.team.slug });

  return (
    <Relay.RootContainer
      Component={AttributionContainer}
      forceFetch
      renderFetched={data => <AttributionContainer {...props} {...data} />}
      route={route}
    />
  );
};

Attribution.contextTypes = {
  store: PropTypes.object,
};

export default Attribution;
