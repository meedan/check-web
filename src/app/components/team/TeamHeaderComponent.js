import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import { injectIntl, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import UserAvatarRelay from '../../relay/UserAvatarRelay';
import CheckContext from '../../CheckContext';
import {
  Row,
  Offset,
  HeaderTitle,
  headerHeight,
  black05,
  avatarStyle,
  avatarSize,
} from '../../styles/js/shared';

const DrawerButtonGroup = styled(Row)`
  align-items: center;
  display: flex;
  height: ${headerHeight};
  overflow: hidden;
  width: 100%;
  cursor: pointer;
  &:hover {
    background-color: ${black05};
  }
`;

class TeamHeaderComponent extends Component {

  componentWillMount() {
    this.updateContext();
  }

  componentWillUpdate() {
    this.updateContext();
  }

  updateContext() {
    new CheckContext(this).setContextStore({ team: this.props.team });
  }

  render() {
    const team = this.props.team;
    const isProjectUrl = /(.*\/project\/[0-9]+)/.test(window.location.pathname);

    const { loggedIn } = this.props;

    // Team Avatar
    const TeamAvatar = styled.div`
      ${avatarStyle}
      background-image: url(${team.avatar});
      width: ${avatarSize};
      height: ${avatarSize};
    `;

    const userAvatarOrSignIn = (() => {
      if (loggedIn) {
        return (
          <Offset>
            <Row>
              <UserAvatarRelay {...this.props} />
            </Row>
          </Offset>
        );
      }
      return (
        <Offset key="header.signIn">
          <Link to="/">
            <RaisedButton
              primary
              label={
                <FormattedMessage
                  defaultMessage="Sign In"
                  id="headerActions.signIn"
                />
              }
            />
          </Link>
        </Offset>
      );
    })();

    return (
      <div>
        <DrawerButtonGroup
          title={team.name}
          className="header-actions__drawer-toggle"
          onClick={this.props.toggle}
        >
          {userAvatarOrSignIn}
          {isProjectUrl
            ? <Offset>
              <TeamAvatar />
            </Offset>
            : <Row>
              <Offset>
                <TeamAvatar />
              </Offset>
              <HeaderTitle>
                {team.name}
              </HeaderTitle>
            </Row>}
        </DrawerButtonGroup>
      </div>
    );
  }
}

TeamHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(TeamHeaderComponent);
