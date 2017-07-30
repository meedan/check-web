import React, { Component } from 'react';
import Relay from 'react-relay';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import styled from 'styled-components';
import ProjectRoute from '../../relay/ProjectRoute';
import CheckContext from '../../CheckContext';
import { units, black54, black32 } from '../../styles/js/variables';

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
    const path = window.location.pathname;

    const currentProject = this.props.project;

    let backUrl = path.match(/(.*\/project\/[0-9]+)/)[1];
    if (path.match(/\/media\/[0-9]+\/.+/)) {
      backUrl = path.match(/(.*\/media\/[0-9]+)/)[1];
    }

    const Wrapper = styled.div`
      display: 'flex',
      alignItems: 'center',
    `;

    const styles = {
      menuItemStyle: {
        minWidth: 200,
        padding: `${units(2)} 0`,
        lineHeight: units(2),
        whiteSpace: 'wrap',
      },
      menuStyle: { minWidth: 200 },
      labelStyle: { color: black54 },
      dropDownMenuStyle: { maxWidth: '50vw' },
      iconStyle: { fill: black32 },
      underlineStyle: { borderWidth: 0 },
      iconButton: { marginRight: units(2) },
    };

    const isProjectSubpage = path.length > backUrl.length;
    return (
      <Wrapper>
        {isProjectSubpage
          ? <IconButton
            className="project-header__back-button"
            href={backUrl}
            style={styles.IconButton}
          >
            <IconArrowBack />
          </IconButton>
          : null}

        <DropDownMenu
          autoWidth={false}
          className="project-header__title"
          iconStyle={styles.iconStyle}
          labelStyle={styles.labelStyle}
          menuItemStyle={styles.menuItemStyle}
          menuStyle={styles.menuStyle}
          style={styles.dropDownMenuStyle}
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
        </DropDownMenu>
      </Wrapper>
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
