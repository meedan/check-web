import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import TeamHeader from './team/TeamHeader';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import HeaderActions from './HeaderActions';
import Can from './Can';
import { Link } from 'react-router';
import ContentColumn from './layout/ContentColumn';

class Header extends Component {
  render() {
    const { state, loggedIn } = this.props;
    const path = this.props.location ? this.props.location.pathname : window.location.pathname;
    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);
    const joinPage = /^\/([^\/]+)\/join$/.test(path);

    const defaultHeader = (
      <header className="header header--default">
        <ContentColumn wide className="header__container">
          { showCheckLogo ?
            (<Link to="/check/teams" className="header__app-link"><img src="/images/logo/check.svg" /></Link>) :
            (joinPage ? (<div className="header__team"><TeamPublicHeader {...this.props} /></div>) : (<div className="header__team"><TeamHeader {...this.props} /></div>))
          }
          <ProjectHeader {...this.props} />
          <HeaderActions {...this.props} loggedIn={loggedIn} />
        </ContentColumn>
      </header>
    );

    return defaultHeader;
  }
}

export default Header;
