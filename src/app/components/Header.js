import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';
import Relay from 'react-relay/classic';
import IconSearch from 'material-ui/svg-icons/action/search';
import { FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import rtlDetect from 'rtl-detect';
import TeamHeader from './team/TeamHeader';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import BackArrow from './layout/BackArrow';
import CheckContext from '../CheckContext';
import { stringHelper } from '../customHelpers';
import PublicTeamRoute from '../relay/PublicTeamRoute';
import teamPublicFragment from '../relay/teamPublicFragment';
import ProjectMenuRelay from '../relay/containers/ProjectMenuRelay';
import SourceMenuRelay from '../relay/containers/SourceMenuRelay';
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
class HeaderComponent extends React.Component {
  componentWillMount() {
    this.handleQuery();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleQuery = () => {
    const { team, teamSlug } = this.props;

    if (!team && teamSlug) {
      this.getContext().history.push('/check/not-found');
    }
  };

  render() {
    const {
      children,
      team,
      loggedIn,
      drawerToggle,
      currentUserIsMember,
      intl: { locale },
    } = this.props;

    const inTeamContext = team ? this.props.inTeamContext : false;

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
        containerElement={<Link to={`/${this.props.params.team}/search/list`} />}
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

    const signInButton = !loggedIn ? (
      <Link to="/">
        <RaisedButton
          primary
          className="header__signin-button"
          onClick={saveCurrentPage}
          label={<FormattedMessage defaultMessage="Sign In" id="headerActions.signIn" />}
        />
      </Link>
    ) : null;

    const teamPrivateContentShouldShow =
      (inTeamContext && currentUserIsMember) || (inTeamContext && !this.props.team.private);

    const teamPublicContentShouldShow =
      inTeamContext && !currentUserIsMember && this.props.team.private;

    const backUrl = (children && children.props.route.path === ':team/settings')
      ? `/${this.props.team.slug}`
      : null;
    const backLabel = <FormattedMessage defaultMessage="Team info" id="headerActions.teamInfo" />;

    const primary = (() => {
      if (teamPrivateContentShouldShow) {
        return (
          <Row containsEllipsis>
            <div><TeamHeader {...this.props} /></div>
            <div><ProjectHeader isRtl {...this.props} /></div>
            <div><BackArrow url={backUrl} label={backLabel} /></div>
          </Row>
        );
      } else if (teamPublicContentShouldShow) {
        return (
          <Row containsEllipsis>
            <TeamPublicHeader isRtl {...this.props} />
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

    const secondary = (
      <AlignOpposite>
        <Row>
          <Offset isRtl>
            {signInButton}
          </Offset>
          {teamPrivateContentShouldShow && editProjectMenuItem}
          <SourceMenuRelay {...this.props} />
          {teamPrivateContentShouldShow && trashButton}
          {teamPrivateContentShouldShow && searchButton}
          <UserMenuRelay {...this.props} />
        </Row>
      </AlignOpposite>
    );

    return (
      <HeaderBar>
        {primary}
        {secondary}
      </HeaderBar>
    );
  }
}

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
