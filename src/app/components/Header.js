import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Relay from 'react-relay';
import IconSearch from 'material-ui/svg-icons/action/search';
import { FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import rtlDetect from 'rtl-detect';
import TeamHeaderRelay from '../relay/containers/TeamHeaderRelay';
import TeamPublicHeaderRelay from '../relay/containers/TeamPublicHeaderRelay';
import ProjectHeader from './project/ProjectHeader';
import { stringHelper } from '../customHelpers';
import PublicTeamRoute from '../relay/PublicTeamRoute';
import teamPublicFragment from '../relay/teamPublicFragment';
import ProjectMenuRelay from '../relay/ProjectMenuRelay';
import TeamMenuRelay from '../relay/TeamMenuRelay';

import {
  units,
  mediaQuery,
  headerHeight,
  Row,
  Offset,
  black02,
  StyledIconButton,
} from '../styles/js/shared';

const HeaderBar = styled.div`
  background-color: ${black02};
  display: flex;
  align-items: center;
  padding: 0 ${units(2)};
  height: ${headerHeight};
  /* Relative positioning is used here to create a new
  positioning context to avoid a z-index inconsistency
  on Safari, Safari Mobile, Ubuntu Chrome,
  Ubuntu Firefox 2017-9-20 CGB */
  position: relative;
  z-index: 1;
  ${mediaQuery.handheld`
    padding: 0 ${units(1)};
  `}
`;

class HeaderComponent extends Component {
  render() {
    const locale = this.props.intl.locale;
    const { inTeamContext, loggedIn, drawerToggle, currentUserIsMember } = this.props;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';

    const AlignOpposite = styled.div`
      margin-${fromDirection}: auto;
      `;

    const editProjectMenuItem = (
      <ProjectMenuRelay key="headerActions.projectMenu" {...this.props} />
    );

    const trashButton = <TeamMenuRelay {...this.props} />;

    const searchButton = (
      <StyledIconButton
        key="header.searchButton"
        className="header-actions__search-icon"
        containerElement={<Link to={`/${this.props.params.team}/search`} />}
        name="search"
        tooltip={<FormattedMessage defaultMessage="Search" id="headerActions.search" />}
      >
        <IconSearch />
      </StyledIconButton>
    );

    const checkLogo = <img width={units(8)} alt="Team Logo" src={stringHelper('LOGO_URL')} />;

    const signInButton = (() => {
      if (!loggedIn) {
        return (
          <Link to="/">
            <RaisedButton
              primary
              label={<FormattedMessage defaultMessage="Sign In" id="headerActions.signIn" />}
            />
          </Link>
        );
      }
      return null;
    })();

    const teamPrivateContentShouldShow =
      (inTeamContext && currentUserIsMember) || (inTeamContext && !this.props.team.private);

    const teamPublicContentShouldShow =
      inTeamContext && !currentUserIsMember && this.props.team.private;

    const primary = (() => {
      if (teamPrivateContentShouldShow) {
        return (
          <Row containsEllipsis>
            <div><TeamHeaderRelay {...this.props} /></div>
            <div><ProjectHeader isRtl {...this.props} /></div>
          </Row>
        );
      } else if (teamPublicContentShouldShow) {
        return (
          <Row containsEllipsis>
            <TeamPublicHeaderRelay isRtl {...this.props} />
          </Row>
        );
      }

      // Otherwise display the most basic header
      return (
        <Row>
          <div onClick={drawerToggle}>{checkLogo}</div>
        </Row>
      );
    })();

    const secondary = (() =>
      <AlignOpposite>
        <Row>
          <Offset isRtl>
            {signInButton}
          </Offset>
          {teamPrivateContentShouldShow && editProjectMenuItem}
          {teamPrivateContentShouldShow && trashButton}
          {teamPrivateContentShouldShow && searchButton}
        </Row>
      </AlignOpposite>)();

    return (
      <HeaderBar>
        {primary}
        {secondary}
      </HeaderBar>
    );
  }
}

class Header extends Component {
  render() {
    if (this.props.inTeamContext) {
      const HeaderContainer = Relay.createContainer(HeaderComponent, {
        fragments: {
          team: () => teamPublicFragment,
        },
      });

      const teamSlug = this.props.params.team;

      const route = new PublicTeamRoute({ teamSlug });

      return (
        <Relay.RootContainer
          Component={HeaderContainer}
          route={route}
          renderFetched={data => <HeaderContainer {...this.props} {...data} />}
        />
      );
    }

    return <HeaderComponent {...this.props} />;
  }
}

export default Header;
export { HeaderComponent };
