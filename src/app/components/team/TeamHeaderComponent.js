import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
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
    const { team, isRtl } = this.props;

    // Team Avatar
    const TeamAvatar = styled.div`
      ${avatarStyle}
      background-image: url(${team.avatar});
      width: ${avatarSize};
      height: ${avatarSize};
    `;

    return (
      <div>
        <DrawerButtonGroup
          title={team.name}
          className="header-actions__drawer-toggle"
          onClick={this.props.drawerToggle}
        >
          {isProjectUrl ?
            <OffsetBothSides>
              <TeamAvatar />
            </OffsetBothSides>
            :
            <Row>
              <OffsetBothSides>
                <TeamAvatar />
              </OffsetBothSides>
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
  store: PropTypes.object,
};

export default injectIntl(TeamHeaderComponent);
