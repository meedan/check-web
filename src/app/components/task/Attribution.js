import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage, injectIntl } from 'react-intl';
import TeamRoute from '../../relay/TeamRoute';
import CheckContext from '../../CheckContext';
import Select from 'react-select';
import Chip from 'material-ui/Chip';
import { StyledTagsWrapper } from '../../styles/js/shared';
import styled from 'styled-components';
import { units } from '../../styles/js/shared';

class AttributionComponent extends React.Component {
  constructor(props) {
    super(props);

    let selectedUsers = [];
    let selectedUserIds = [];
    props.task.first_response.attribution.edges.forEach((user) => {
      selectedUserIds.push(user.node.dbid);
      selectedUsers.push({ value: user.node.dbid, label: user.node.name });
    });

    let unselectedUsers = [];
    props.team.team_users.edges.forEach((team_user) => {
      const node = team_user.node;
      if (node.status === 'member') {
        if (selectedUserIds.indexOf(node.user.dbid) === -1) {
          unselectedUsers.push({ value: node.user.dbid, label: node.user.name });
        }
      }
    });

    this.state = {
      selectedUsers,
      unselectedUsers,
    };
  }

  handleChange(value) {
    let selectedUsers = this.state.selectedUsers.slice(0);
    let unselectedUsers = [];
    selectedUsers.push(value);
    this.state.unselectedUsers.forEach((user) => {
      if (user.value !== value.value) {
        unselectedUsers.push(user);
      }
    });

    this.setState({ selectedUsers, unselectedUsers });
  }

  handleDelete(value) {
    let unselectedUsers = this.state.unselectedUsers.slice(0);
    let selectedUsers = [];
    unselectedUsers.push(value);
    this.state.selectedUsers.forEach((user) => {
      if (user.value !== value.value) {
        selectedUsers.push(user);
      }
    });

    this.setState({ selectedUsers, unselectedUsers });
  }

  resize() {
    // https://github.com/callemall/material-ui/issues/5793#issuecomment-282306001
    window.dispatchEvent(new Event('resize'));
  }

  componentDidMount() {
    this.resize();
  }

  componentDidUpdate() {
    this.resize();
  }

  render() {
    const { task, team } = this.props;

    const StyledSelect = styled(Select)`
      margin-bottom: 200px;

      .Select-control {
        border-left: 0;
        border-right: 0;
        border-top: 0;
        border-radius: 0;
      }
    `;

    let selectedUserIds = [];
    this.state.selectedUsers.forEach((user) => {
      selectedUserIds.push(user.value);
    });
    const value = selectedUserIds.join(',');

    return (
      <div id="attribution">
        <form name={`edit-task-attribution-${task.dbid}`}>

          <input type="hidden" value={value} name="selected-user-ids" id={`attribution-${task.dbid}`} />
          
          <div style={{ marginTop: units(4), marginBottom: units(4) }}>
            <StyledTagsWrapper className="attribution__selected-users">
              {this.state.selectedUsers.map(user =>
                <Chip key={user.value} className="attribution__selected-user" onRequestDelete={this.handleDelete.bind(this, user)}>
                  {user.label}
                </Chip>
              )}
            </StyledTagsWrapper>
          </div>

          <StyledSelect options={this.state.unselectedUsers}
                        onChange={this.handleChange.bind(this)}
                        noResultsText={<FormattedMessage id="attribution.noResults" defaultMessage="No results" />}
                        placeholder={<FormattedMessage id="attribution.search" defaultMessage="Search team members" />}
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
              }
            }
          }
        }
      }
    `,
  },
});

class Attribution extends React.Component {
  render() {
    const context = new CheckContext(this).getContextStore();

    const route = new TeamRoute({ teamSlug: context.team.slug });

    return (
      <Relay.RootContainer
        Component={AttributionContainer}
        renderFetched={data => <AttributionContainer {...this.props} {...data} />}
        route={route}
      />
    );
  }
}

Attribution.contextTypes = {
  store: React.PropTypes.object,
};

export default Attribution;
