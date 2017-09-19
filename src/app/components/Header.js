import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import IconButton from 'material-ui/IconButton';
import IconSearch from 'material-ui/svg-icons/action/search';
import RaisedButton from 'material-ui/RaisedButton';
import { FormattedMessage, injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';
import UserAvatarRelay from '../relay/UserAvatarRelay';
import TeamHeader from './team/TeamHeader';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import { stringHelper } from '../customHelpers';
import {
  units,
  mediaQuery,
  headerHeight,
  headerOffset,
  Row,
  black02,
} from '../styles/js/shared';

const HeaderBar = styled.div`
  background-color: ${black02};
  display: flex;
  align-items: center;
  padding: 0 ${units(2)};
  z-index: 2;
  height: ${headerHeight};
  overflow: hidden;
  ${mediaQuery.handheld`
    padding: 0 ${units(1)};
  `}
`;

class Header extends Component {
  render() {
    const locale = this.props.intl.locale;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';
    const hasTeam = this.props.params && this.props.params.team;
    const { loggedIn } = this.props;
    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;
    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);
    const joinPage = /^\/([^/]+)\/join$/.test(path);

    const AlignOpposite = styled.div`
      margin-${fromDirection}: auto;
      `;

    const Offset = styled.div`
      padding: 0 ${headerOffset} !important;
    `;

    const userAvatarButton = (() => {
      if (loggedIn) {
        return (
          <IconButton key="header.userAvatar" style={{ width: units(7), height: units(7) }}>
            <UserAvatarRelay {...this.props} />
          </IconButton>
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

    const searchButton = (
      <Offset key="header.searchButton">
        <IconButton
          className="header-actions__search-icon"
          containerElement={<Link to={`/${this.props.params.team}/search`} />}
          name="search"
        >
          <IconSearch />
        </IconButton>
      </Offset>
    );

    const teamAndProjectHeader = (
      <Row containsEllipsis>
        <Offset>
          <TeamHeader {...this.props} />
        </Offset>
        <Offset>
          <ProjectHeader {...this.props} />
        </Offset>
      </Row>
    );

    const checkLogo = (
      <Link to="/check/teams">
        <img
          width={units(8)}
          alt="Team Logo"
          src={stringHelper('LOGO_URL')}
        />
      </Link>
    );

    const primary = (() => {
      if (showCheckLogo) {
        return checkLogo;
      }
      if (joinPage) {
        return (
          <Row containsEllipsis>
            <TeamPublicHeader {...this.props} />
          </Row>
        );
      }
      return (
        <Row containsEllipsis>
          {userAvatarButton}
          {teamAndProjectHeader}
        </Row>
      );
    })();

    const secondary = (() => {
      if (hasTeam) {
        return (
          <AlignOpposite>
            <Row>
              {searchButton}
            </Row>
          </AlignOpposite>
        );
      }
      return (
        null
      );
    })();

    return (
      <HeaderBar>
        {primary}
        {secondary}
      </HeaderBar>
    );
  }
}

export default injectIntl(Header);
