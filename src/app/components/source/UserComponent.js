import React from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import rtlDetect from 'rtl-detect';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import UserInfo from './UserInfo';
import UserInfoEdit from './UserInfoEdit';
import { can } from '../Can';
import HeaderCard from '../HeaderCard';
import PageTitle from '../PageTitle';
import ContentColumn from '../layout/ContentColumn';
import SwitchTeams from '../team/SwitchTeams';

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

    const team =  this.props.user.current_team;
    const { user } = this.props;

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    return (
      <PageTitle prefix={user.source.name} skipTeam={true}>
        <div className="profile">
          <HeaderCard
            canEdit={can(user.permissions, 'update User')}
            direction={direction}
            handleEnterEditMode={this.handleEnterEditMode.bind(this)}
            isEditing={this.state.isEditing}
          >
            <ContentColumn>
              { this.state.isEditing ? <UserInfoEdit user={user} onCancelEdit={this.handleLeaveEditMode} /> : <UserInfo user={user} />}
            </ContentColumn>
          </HeaderCard>
          <ContentColumn>
            <SwitchTeams />
          </ContentColumn>
        </div>
      </PageTitle>
    );
  }
}

export default injectIntl(UserComponent);
