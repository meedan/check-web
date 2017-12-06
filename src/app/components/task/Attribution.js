import React from 'react';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
import Chip from 'material-ui/Chip';
import styled from 'styled-components';
import {
  StyledTagsWrapper,
  units,
} from '../../styles/js/shared';

class Attribution extends React.Component {
  static resize() {
    // https://github.com/callemall/material-ui/issues/5793#issuecomment-282306001
    window.dispatchEvent(new Event('resize'));
  }

  constructor(props) {
    super(props);

    const selectedUsers = [];
    const selectedUserIds = [];
    props.task.first_response.attribution.edges.forEach((user) => {
      selectedUserIds.push(user.node.dbid);
      selectedUsers.push({ value: user.node.dbid, label: user.node.name });
    });

    const unselectedUsers = [];
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

  // eslint-disable-next-line class-methods-use-this
  componentDidMount() {
    Attribution.resize();
  }

  // eslint-disable-next-line class-methods-use-this
  componentDidUpdate() {
    Attribution.resize();
  }

  handleChange(value) {
    const selectedUsers = this.state.selectedUsers.slice(0);
    const unselectedUsers = [];
    selectedUsers.push(value);
    this.state.unselectedUsers.forEach((user) => {
      if (user.value !== value.value) {
        unselectedUsers.push(user);
      }
    });

    this.setState({ selectedUsers, unselectedUsers });
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
  }

  render() {
    const { task } = this.props;

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
        <form name={`edit-task-attribution-${task.dbid}`}>

          <input type="hidden" value={value} name="selected-user-ids" id={`attribution-${task.dbid}`} />

          <div style={{ marginTop: units(4), marginBottom: units(4) }}>
            <StyledTagsWrapper className="attribution__selected-users">
              {this.state.selectedUsers.map(user =>
                <Chip key={user.value} className="attribution__selected-user" onRequestDelete={this.handleDelete.bind(this, user)}>
                  {user.label}
                </Chip>,
              )}
            </StyledTagsWrapper>
          </div>

          <StyledSelect
            options={this.state.unselectedUsers}
            onChange={this.handleChange.bind(this)}
            noResultsText={<FormattedMessage id="attribution.noResults" defaultMessage="No results" />}
            placeholder={<FormattedMessage id="attribution.search" defaultMessage="Search team members" />}
          />
        </form>
      </div>
    );
  }
}

export default Attribution;
