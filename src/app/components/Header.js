import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';
import Relay from 'react-relay';
import IconSearch from 'material-ui/svg-icons/action/search';
import { FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import rtlDetect from 'rtl-detect';
import TeamHeader from './team/TeamHeader';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import { stringHelper } from '../customHelpers';
import PublicTeamRoute from '../relay/PublicTeamRoute';
import teamPublicFragment from '../relay/teamPublicFragment';
import ProjectMenuRelay from '../relay/containers/ProjectMenuRelay';
import TeamMenuRelay from '../relay/containers/TeamMenuRelay';
import UserMenuRelay from '../relay/containers/UserMenuRelay';

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

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
const HeaderComponent = (props) => {
  const {
    inTeamContext,
    loggedIn,
    drawerToggle,
    currentUserIsMember,
    intl: { locale },
  } = props;
  const isRtl = rtlDetect.isRtlLang(locale);
  const fromDirection = isRtl ? 'right' : 'left';

  const AlignOpposite = styled.div`
    margin-${fromDirection}: auto;
    `;

  const editProjectMenuItem = (
    <ProjectMenuRelay key="headerActions.projectMenu" {...props} />
  );

  const trashButton = <TeamMenuRelay {...props} />;

  const searchButton = (
    <StyledIconButton
      key="header.searchButton"
      className="header-actions__search-icon"
      containerElement={<Link to={`/${props.params.team}/search`} />}
      name="search"
      tooltip={<FormattedMessage defaultMessage="Search" id="headerActions.search" />}
    >
      <IconSearch />
    </StyledIconButton>
  );

  const checkLogo = <img width={units(8)} alt="Team Logo" src={stringHelper('LOGO_URL')} />;

  const saveCurrentPage = () => {
    const path = window.location.pathname;
    if (path !== '/') {
      window.storage.set('previousPage', path);
    }
  };

  const signInButton = (() => {
    if (!loggedIn) {
      return (
        <Link to="/">
          <RaisedButton
            primary
            className="header__signin-button"
            onClick={saveCurrentPage}
            label={<FormattedMessage defaultMessage="Sign In" id="headerActions.signIn" />}
          />
        </Link>
      );
    }
    return null;
  })();

  const teamPrivateContentShouldShow =
    (inTeamContext && currentUserIsMember) || (inTeamContext && !props.team.private);

  const teamPublicContentShouldShow =
    inTeamContext && !currentUserIsMember && props.team.private;

  const primary = (() => {
    if (teamPrivateContentShouldShow) {
      return (
        <Row containsEllipsis>
          <div><TeamHeader {...props} /></div>
          <div><ProjectHeader isRtl {...props} /></div>
        </Row>
      );
    } else if (teamPublicContentShouldShow) {
      return (
        <Row containsEllipsis>
          <TeamPublicHeader isRtl {...props} />
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

  const secondary = (() => (
    <AlignOpposite>
      <Row>
        <Offset isRtl>
          {signInButton}
        </Offset>
        {teamPrivateContentShouldShow && editProjectMenuItem}
        {teamPrivateContentShouldShow && trashButton}
        {teamPrivateContentShouldShow && searchButton}
        <UserMenuRelay {...props} />
      </Row>
    </AlignOpposite>))();

  return (
    <HeaderBar>
      {primary}
      {secondary}
    </HeaderBar>
  );
};

HeaderComponent.contextTypes = {
  store: PropTypes.object,
};

const Header = (props) => {
  if (props.inTeamContext) {
    const HeaderContainer = Relay.createContainer(HeaderComponent, {
      fragments: {
        team: () => teamPublicFragment,
      },
    });

    const teamSlug = props.params.team;
    const route = new PublicTeamRoute({ teamSlug });

    return (
      <Relay.RootContainer
        Component={HeaderContainer}
        route={route}
        renderFetched={data => <HeaderContainer {...props} {...data} />}
      />
    );
  }

  return <HeaderComponent {...props} />;
};

export { Header as default, HeaderComponent };
