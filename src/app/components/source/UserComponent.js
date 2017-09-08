import React from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import rtlDetect from 'rtl-detect';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import UserInfo from './UserInfo';
import Can from '../Can';
import HeaderCard from '../HeaderCard';
import Message from '../Message';
import PageTitle from '../PageTitle';
import ContentColumn from '../layout/ContentColumn';

class UserComponent extends React.Component {
  handleEnterEditMode = () => {

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
            teamPermissions={'{}'}
            direction={direction}
            handleEnterEditMode={this.handleEnterEditMode.bind(this)}
            isEditing={false}
          >
            <ContentColumn>
              <Message message={''} />
              <UserInfo user={user} />
            </ContentColumn>
          </HeaderCard>
        </div>
      </PageTitle>
    );
  }
}

export default injectIntl(UserComponent);
