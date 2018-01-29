import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import rtlDetect from 'rtl-detect';
import { Tabs, Tab } from 'material-ui/Tabs';
import UserInfo from './UserInfo';
import UserAssignments from './UserAssignments';
import UserInfoEdit from './UserInfoEdit';
import { can } from '../Can';
import HeaderCard from '../HeaderCard';
import PageTitle from '../PageTitle';
import SwitchTeamsComponent from '../team/SwitchTeamsComponent';
import { ContentColumn } from '../../styles/js/shared';

class UserComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      showTab: 'assignments',
    };
  }

  handleEnterEditMode = () => {
    this.setState({ isEditing: true });
  };

  handleLeaveEditMode = () => {
    this.setState({ isEditing: false });
  };

  handleTabChange = (value) => {
    this.setState({
      showTab: value,
    });
  };

  render() {
    const { user } = this.props;

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    return (
      <PageTitle prefix={user.name} skipTeam>
        <div className="source">
          <HeaderCard
            canEdit={can(user.permissions, 'update User')}
            direction={direction}
            handleEnterEditMode={this.handleEnterEditMode.bind(this)}
            isEditing={this.state.isEditing}
          >
            <ContentColumn>
              { this.state.isEditing ?
                <UserInfoEdit user={user} onCancelEdit={this.handleLeaveEditMode} />
                :
                <UserInfo user={user} />
              }
            </ContentColumn>
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
            </Tabs>
          </HeaderCard>
          <ContentColumn>
            { this.state.showTab === 'teams' ? <SwitchTeamsComponent user={user} /> : null}
            { this.state.showTab === 'assignments' ? <UserAssignments user={user} /> : null}
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
