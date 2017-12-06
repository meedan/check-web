import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';
import UserInfo from './UserInfo';
import UserInfoEdit from './UserInfoEdit';
import { can } from '../Can';
import HeaderCard from '../HeaderCard';
import PageTitle from '../PageTitle';
import SwitchTeams from '../team/SwitchTeams';
import { ContentColumn } from '../../styles/js/shared';

class User extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
    };
  }

  handleEnterEditMode = () => {
    this.setState({ isEditing: true });
  };

  handleLeaveEditMode = () => {
    this.setState({ isEditing: false });
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
                <UserInfoEdit user={user} onCancelEdit={this.handleLeaveEditMode} /> :
                <UserInfo user={user} />
              }
            </ContentColumn>
          </HeaderCard>
          <ContentColumn>
            <SwitchTeams user={user} />
          </ContentColumn>
        </div>
      </PageTitle>
    );
  }
}

User.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(User);
