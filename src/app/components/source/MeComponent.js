import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import cx from 'classnames/bind';
import UserEmail from '../user/UserEmail';
import UserInfo from './UserInfo';
import UserPrivacy from './UserPrivacy';
import UserSecurity from './UserSecurity';
import UserInfoEdit from './UserInfoEdit';
import { can } from '../Can';
import PageTitle from '../PageTitle';
import CheckContext from '../../CheckContext';
import SwitchTeamsComponent from '../team/SwitchTeamsComponent';
import styles from './User.module.css';

class MeComponent extends React.Component {
  constructor(props) {
    super(props);
    const { tab } = this.props.params;
    const showTab = (typeof tab === 'undefined') ? 'workspaces' : tab;
    this.state = {
      showTab,
    };
  }

  componentWillMount() {
    const user = this.props.me;
    if (!user.is_active) {
      browserHistory.push('/check/not-found');
    }
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleTabChange = (e, value) => {
    browserHistory.push(`/check/me/${value}`);
    this.setState({
      showTab: value,
    });
  };

  render() {
    const user = this.props.me;
    const isEditing = this.props.route.isEditing && can(user.permissions, 'update User');
    const context = this.getContext();
    const isUserSelf = (user.id === context.currentUser.id);

    return (
      <PageTitle prefix={user.name}>
        <div className={cx('source', styles['user-settings-wrapper'])}>
          <div className={styles['user-content']}>
            { isEditing ?
              <UserInfoEdit user={user} /> :
              <>
                <div className={styles['user-info-wrapper']}>
                  <UserEmail user={user} />
                </div>
                <UserInfo user={user} context={context} />
              </>
            }
            { isEditing ?
              null :
              <div className={styles['user-info-tabs-wrapper']}>
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
                        id="meComponent.teams"
                        defaultMessage="Workspaces"
                        description="Label of the workspaces tab in the user profile page"
                      />
                    }
                    value="workspaces"
                  />
                  { isUserSelf ?
                    <Tab
                      id="privacy-tab"
                      label={
                        <FormattedMessage
                          id="meComponents.privacy"
                          defaultMessage="Privacy"
                          description="Label of the privacy tab in the user profile page"
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
                          id="meComponents.security"
                          defaultMessage="Security"
                          description="Label of the security tab in the user profile page"
                        />
                      }
                      value="security"
                    /> : null
                  }
                </Tabs>
                <div className={styles['user-info-tabs-content']}>
                  { this.state.showTab === 'teams' || this.state.showTab === 'workspaces' ? <SwitchTeamsComponent user={user} /> : null}
                  { this.state.showTab === 'privacy' ? <UserPrivacy user={user} /> : null}
                  { this.state.showTab === 'security' ? <UserSecurity user={user} /> : null}
                </div>
              </div>
            }
          </div>
        </div>
      </PageTitle>
    );
  }
}

MeComponent.contextTypes = {
  store: PropTypes.object,
};

export default MeComponent;
