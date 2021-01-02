import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import UserEmail from '../user/UserEmail';
import UserInfo from './UserInfo';
import UserAssignments from './UserAssignments';
import UserPrivacy from './UserPrivacy';
import UserSecurity from './UserSecurity';
import UserInfoEdit from './UserInfoEdit';
import { can } from '../Can';
import HeaderCard from '../HeaderCard';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import SwitchTeamsComponent from '../team/SwitchTeamsComponent';
import { ContentColumn } from '../../styles/js/shared';

class UserComponent extends React.Component {
  constructor(props) {
    super(props);
    const { tab } = this.props.params;
    const showTab = (typeof tab === 'undefined') ? 'assignments' : tab;
    this.state = {
      showTab,
    };
  }

  componentWillMount() {
    const { user } = this.props;
    if (!user.is_active) {
      browserHistory.push('/check/forbidden');
    }
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleTabChange = (e, value) => {
    browserHistory.push(`/check/user/${this.props.user.dbid}/${value}`);
    this.setState({
      showTab: value,
    });
  };

  render() {
    const { user } = this.props;
    const isEditing = this.props.route.isEditing && can(user.permissions, 'update User');
    const context = this.getContext();
    const isUserSelf = (user.id === context.currentUser.id);

    const HeaderContent = () => (
      <Box pt={3} pb={3}>
        { isEditing ?
          <UserInfoEdit user={user} /> :
          <UserInfo user={user} context={context} />
        }
      </Box>
    );

    return (
      <PageTitle prefix={user.name}>
        <div className="source">
          <HeaderCard>
            <ContentColumn>
              <HeaderContent />
              { isEditing ?
                null : (
                  <Tabs
                    indicatorColor="primary"
                    textColor="primary"
                    value={this.state.showTab}
                    onChange={this.handleTabChange}
                  >
                    <Tab
                      id="teams-tab"
                      label={
                        <FormattedMessage
                          id="userComponent.teams"
                          defaultMessage="Workspaces"
                        />
                      }
                      value="workspaces"
                    />
                    <Tab
                      id="assignments-tab"
                      label={
                        <FormattedMessage
                          id="userComponents.assignments"
                          defaultMessage="Assignments"
                        />
                      }
                      value="assignments"
                    />
                    { isUserSelf ?
                      <Tab
                        id="privacy-tab"
                        label={
                          <FormattedMessage
                            id="userComponents.privacy"
                            defaultMessage="Privacy"
                          />
                        }
                        value="privacy"
                      /> : null
                    }
                    { isUserSelf ?
                      <Tab
                        id="security-tab"
                        label={
                          <FormattedMessage
                            id="userComponents.security"
                            defaultMessage="Security"
                          />
                        }
                        value="security"
                      /> : null
                    }
                  </Tabs>
                )
              }
            </ContentColumn>
          </HeaderCard>
          <ContentColumn>
            { isEditing ?
              null :
              <div>
                <UserEmail user={user} />
                { this.state.showTab === 'teams' || this.state.showTab === 'workspaces' ? <SwitchTeamsComponent user={user} /> : null}
                { this.state.showTab === 'assignments' ? <UserAssignments user={user} /> : null}
                { this.state.showTab === 'privacy' ? <UserPrivacy user={user} /> : null}
                { this.state.showTab === 'security' ? <UserSecurity user={user} /> : null}
              </div>
            }
          </ContentColumn>
        </div>
      </PageTitle>
    );
  }
}

UserComponent.contextTypes = {
  store: PropTypes.object,
};

export default UserComponent;
