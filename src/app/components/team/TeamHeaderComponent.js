import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import rtlDetect from 'rtl-detect';
import { injectIntl } from 'react-intl';

import CheckContext from '../../CheckContext';
import {
  defaultBorderRadius,
  subheading2,
  ellipsisStyles,
  avatarStyle,
  units,
  white,
  appBarInnerHeight,
  avatarSize,
} from '../../styles/js/variables.js';

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
    const locale = this.props.intl.locale;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';

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
      height: ${appBarInnerHeight};
      overflow: hidden;
    `;

    const TeamName = styled.h3`
      ${ellipsisStyles}
      font: ${subheading2};
      margin-${fromDirection}: ${units(2)};
    `;

    const TeamAvatar = styled.div`
      ${avatarStyle}
      background-image: url(${team.avatar});
      background-color: ${white};
      margin: 0;
      width: ${avatarSize};
      height: ${avatarSize};
    `;

    return (
      <TeamNav>
        <TeamLink to={`/${team.slug}`} title={team.name} className="team-header__avatar">
          <TeamAvatar />
          {isProjectUrl ? null : <TeamName>{team.name}</TeamName>}
        </TeamLink>
      </TeamNav>
    );
  }
}

TeamHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(TeamHeaderComponent);
