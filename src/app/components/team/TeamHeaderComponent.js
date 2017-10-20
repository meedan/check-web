import React, { Component } from 'react';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import IconMenu from 'material-ui/svg-icons/navigation/menu';
import UserAvatarRelay from '../../relay/UserAvatarRelay';
import CheckContext from '../../CheckContext';
import {
  Row,
  Offset,
  OffsetBothSides,
  HeaderTitle,
  headerHeight,
  black05,
  avatarStyle,
  avatarSize,
  HiddenOnMobile,
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
    const isProjectUrl = /(.*\/project\/[0-9]+)/.test(window.location.pathname);
    const { loggedIn, team, isRtl } = this.props;

    // Team Avatar
    const TeamAvatar = styled.div`
      ${avatarStyle}
      background-image: url(${team.avatar});
      width: ${avatarSize};
      height: ${avatarSize};
    `;

    const userAvatarOrMenuButton = (() => {
      if (!loggedIn || !team) {
        return (
          <OffsetBothSides>
            <IconMenu />
          </OffsetBothSides>
        );
      }
      return (
        <HiddenOnMobile>
          <OffsetBothSides>
            <Row>
              <UserAvatarRelay {...this.props} />
            </Row>
          </OffsetBothSides>
        </HiddenOnMobile>
      );
    })();

    return (
      <div>
        <DrawerButtonGroup
          title={team.name}
          className="header-actions__drawer-toggle"
          onClick={this.props.drawerToggle}
        >
          {userAvatarOrMenuButton}
          {isProjectUrl
            ? <Offset isRtl={isRtl}>
              <TeamAvatar />
            </Offset>
            : <Row>
              <Offset isRtl={isRtl}>
                <TeamAvatar />
              </Offset>
              <Offset isRtl={isRtl}>
                <HeaderTitle>
                  {team.name}
                </HeaderTitle>
              </Offset>
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
