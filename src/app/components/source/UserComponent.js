import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { injectIntl, FormattedMessage } from 'react-intl';
import rtlDetect from 'rtl-detect';
import { Tabs, Tab } from 'material-ui/Tabs';
import UserEmail from '../user/UserEmail';
import UserInfo from './UserInfo';
import UserAssignments from './UserAssignments';
import UserPrivacy from './UserPrivacy';
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
      this.getContext().history.push('/check/forbidden');
    }
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleTabChange = (value) => {
    browserHistory.push(`/check/me/${value}`);
    this.setState({
      showTab: value,
    });
  };

  render() {
    const { user } = this.props;
    const isEditing = this.props.route.isEditing && can(user.permissions, 'update User');
    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);
    const { currentUser } = this.getContext();
    const isUserSelf = (user.id === currentUser.id);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    return (
      <PageTitle prefix={user.name} skipTeam>
        <div className="source">
          <HeaderCard direction={direction}>
            <ContentColumn>
              { isEditing ?
                <UserInfoEdit user={user} /> :
                <div>
                  <UserInfo user={user} />
                  <Tabs value={this.state.showTab} onChange={this.handleTabChange}>
                    <Tab
                      id="teams-tab"
                      label={
                        <FormattedMessage
                          id="userComponent.teams"
                          defaultMessage="Teams"
                        />
                      }
                      value="teams"
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
                  </Tabs>
                </div>
              }
            </ContentColumn>
          </HeaderCard>
          <ContentColumn>
            { isEditing ?
              null :
              <div>
                <UserEmail user={user} />
                { this.state.showTab === 'teams' ? <SwitchTeamsComponent user={user} isRtl={isRtl} /> : null}
                { this.state.showTab === 'assignments' ?
                  <UserAssignments
                    direction={direction}
                    user={user}
                    isRtl={isRtl}
                  /> : null
                }
                { this.state.showTab === 'privacy' ? <UserPrivacy user={user} /> : null}
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

export default injectIntl(UserComponent);
