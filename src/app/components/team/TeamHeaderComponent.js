import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import CheckContext from '../../CheckContext';

import {
  Text,
  Row,
  defaultBorderRadius,
  subheading2,
  ellipsisStyles,
  avatarStyle,
  black54,
  headerHeight,
  avatarSize,
  headerOffset,
  mediaQuery,
  headline,
  black87,
  units,
} from '../../styles/js/variables';

class TeamHeaderComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  componentWillMount() {
    this.updateContext();
  }

  componentWillUpdate() {
    this.updateContext();
  }

  updateContext() {
    new CheckContext(this).setContextStore({ team: this.props.team });
  }

  handleToggle = () => this.setState({ open: !this.state.open });

  render() {
    const team = this.props.team;
    const isProjectUrl = /(.*\/project\/[0-9]+)/.test(window.location.pathname);

    const TeamLink = styled(Link)`
      align-items: center;
      display: flex;
      height: 100%;
      overflow: hidden;
      width: 100%;
      cursor: pointer;

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

    const Headline = styled.h2`
      font: ${headline};
      line-height: ${units(6.5)};
      color: ${black87};
    `;

    const TeamAvatar = styled.div`
      ${avatarStyle}
      background-image: url(${team.avatar});
      width: ${avatarSize};
      height: ${avatarSize};
    `;

    const projectList = this.props.team.projects.edges
      .sortp((a, b) => a.node.title.localeCompare(b.node.title))
      .map((p) => {
        const projectPath = `/${this.props.team.slug}/project/${p.node.dbid}`;

        return (
          <MenuItem key={p.node.dbid} href={projectPath}>
            <Text ellipsis>{p.node.title}</Text>
          </MenuItem>
        );
      });

    return (
      <div>
        <TeamNav>
          <TeamLink
            onClick={this.handleToggle}
            title={team.name}
            className="team-header__avatar"
          >
            {isProjectUrl
              ? <TeamAvatar />
              : <Row>
                <TeamAvatar />
                <TeamName>
                  {team.name}
                </TeamName>
              </Row>}
          </TeamLink>
        </TeamNav>
        <Drawer
          docked={false}
          open={this.state.open}
          onRequestChange={open => this.setState({ open })}
        >
          <MenuItem href={`/${this.props.team.slug}/`}>
            <Headline>{team.name}</Headline>
          </MenuItem>
          {projectList}
        </Drawer>
      </div>
    );
  }
}

TeamHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default TeamHeaderComponent;
