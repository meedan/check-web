import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';
import UserInfo from './UserInfo';
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
                <UserInfoEdit user={user} onCancelEdit={this.handleLeaveEditMode} />
                :
                <UserInfo user={user} />
              }
            </ContentColumn>
          </HeaderCard>
          <ContentColumn>
            <SwitchTeamsComponent user={user} />
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
