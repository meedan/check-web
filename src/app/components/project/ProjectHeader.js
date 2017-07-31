import React, { Component } from 'react';
import Relay from 'react-relay';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import styled from 'styled-components';
import ProjectRoute from '../../relay/ProjectRoute';
import CheckContext from '../../CheckContext';
import { mediaQuery, units, black54, headerHeight, headerOffset, black32 } from '../../styles/js/variables';

class ProjectHeaderComponent extends Component {
  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getPusher() {
    const context = new CheckContext(this);
    return context.getContextStore().pusher;
  }

  unsubscribe() {
    const pusher = this.getPusher();
    if (pusher) {
      pusher.unsubscribe(this.props.project.team.pusher_channel);
    }
  }

  subscribe() {
    const pusher = this.getPusher();
    if (pusher) {
      const that = this;
      pusher.subscribe(this.props.project.team.pusher_channel).bind('project_created', () => {
        that.props.relay.forceFetch();
      });
    }
  }

  render() {
    const currentProject = this.props.project;

    const StyledDropDownMenu = styled(DropDownMenu)`
      max-width: 60vw;
      height: ${headerHeight} !important;
      ${mediaQuery.handheld` max-width: 40vw; `}
    `;

    const styles = {
      menuItemStyle: {
        minWidth: 200,
        padding: `${units(2)} 0`,
        lineHeight: units(2),
        whiteSpace: 'wrap',
      },
      menuStyle: {
        minWidth: 200,
      },
      labelStyle: {
        color: black54,
        paddingLeft: 0,
      },
      iconStyle: {
        fill: black32,
      },
      underlineStyle: {
        borderWidth: 0,
      },
      iconButton: {
        marginRight: headerOffset,
      },
    };

    return (
      <StyledDropDownMenu
        autoWidth={false}
        className="project-header__title"
        iconStyle={styles.iconStyle}
        labelStyle={styles.labelStyle}
        menuItemStyle={styles.menuItemStyle}
        menuStyle={styles.menuStyle}
        underlineStyle={styles.underlineStyle}
        value={currentProject.title}
      >
        {currentProject.team.projects.edges
            .sortp((a, b) => a.node.title.localeCompare(b.node.title))
            .map((p) => {
              const projectPath = `/${currentProject.team.slug}/project/${p.node.dbid}`;
              return (
                <MenuItem
                  className="project-list__project"
                  href={projectPath}
                  key={p.node.dbid}
                  primaryText={p.node.title}
                  value={p.node.title}
                />
              );
            })}
      </StyledDropDownMenu>
    );
  }
}

ProjectHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectHeaderContainer = Relay.createContainer(ProjectHeaderComponent, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        get_slack_channel,
        team {
          id,
          dbid,
          slug,
          permissions,
          pusher_channel,
          get_slack_notifications_enabled,
          projects(first: 10000) {
            edges {
              node {
                title,
                dbid,
                id,
              }
            }
          }
        }
      }
    `,
  },
});

class ProjectHeader extends Component {
  render() {
    if (this.props.params && this.props.params.projectId) {
      const route = new ProjectRoute({ contextId: this.props.params.projectId });
      return (<Relay.RootContainer
        Component={ProjectHeaderContainer}
        route={route}
      />);
    }
    return null;
  }
}

export default ProjectHeader;
