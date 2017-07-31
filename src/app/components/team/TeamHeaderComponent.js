import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';

import CheckContext from '../../CheckContext';
import {
  defaultBorderRadius,
  subheading2,
  ellipsisStyles,
  avatarStyle,
  black54,
  headerHeight,
  avatarSize,
  Row,
  headerOffset,
  mediaQuery,
} from '../../styles/js/variables';

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

    const TeamLink = styled(Link)`
      align-items: center;
      display: flex;
      height: 100%;
      overflow: hidden;
      width: 100%;

      &,
      &:hover {
        text-decoration: none;
      }

      &,
      &:visited {
        color: inherit;
      }
    `;

    const TeamNav = styled.nav`
      border-radius: ${defaultBorderRadius};
      display: flex;
      height: ${headerHeight};
      overflow: hidden;
    `;

    const TeamName = styled.h3`
      ${ellipsisStyles}
      font: ${subheading2};
      color: ${black54};
      padding: 0 ${headerOffset};
      ${mediaQuery.handheld`
         max-width: 35vw;
      `}
    `;

    const TeamAvatar = styled.div`
      ${avatarStyle}
      background-image: url(${team.avatar});
      width: ${avatarSize};
      height: ${avatarSize};
    `;

    return (
      <TeamNav>
        <TeamLink to={`/${team.slug}`} title={team.name} className="team-header__avatar">
          {isProjectUrl
            ? <TeamAvatar />
            : <Row>
              <TeamAvatar />
              <TeamName>
                {team.name}
              </TeamName>
            </Row>
            }
        </TeamLink>
      </TeamNav>
    );
  }
}

TeamHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default TeamHeaderComponent;
