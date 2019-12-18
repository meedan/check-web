import React, { Component } from 'react';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import Button from '@material-ui/core/Button';
import MenuItem from 'material-ui/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import InfiniteScroll from 'react-infinite-scroller';
import Can from '../Can';
import CreateProject from '../project/CreateProject';
import TeamRoute from '../../relay/TeamRoute';
import RelayContainer from '../../relay/RelayContainer';

import {
  Text,
  units,
  caption,
} from '../../styles/js/shared';

const messages = defineMessages({
  addProject: {
    id: 'projects.addProject',
    defaultMessage: 'Add list',
  },
  dismiss: {
    id: 'projects.dismiss',
    defaultMessage: 'Dismiss',
  },
});

const pageSize = 20;

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class DrawerProjectsComponent extends Component {
  loadMore() {
    this.props.relay.setVariables({ pageSize: this.props.team.projects.edges.length + pageSize });
  }

  handleToggleDrawer = () => {
    if (this.props.toggleDrawerCallback) {
      this.props.toggleDrawerCallback();
    }
  };

  render() {
    const { props } = this;
    const projectList = (() => {
      if (props.team.projects.edges.length === 0) {
        return (
          <Text style={{ margin: `0 ${units(2)}` }} font={caption}>
            <FormattedMessage
              id="projects.noProjects"
              defaultMessage="No projects yet."
            />
          </Text>
        );
      }

      return props.team.projects.edges
        .sortp((a, b) => a.node.title.localeCompare(b.node.title))
        .map((p) => {
          const projectPath = `/${props.team.slug}/project/${p.node.dbid}`;
          return (
            <Link to={projectPath} key={p.node.dbid} className="project-list__link">
              <MenuItem
                className="project-list__item"
                primaryText={
                  <Text maxWidth="85%" ellipsis>
                    {p.node.title}
                  </Text>
                }
                secondaryText={String(p.node.medias_count)}
              />
            </Link>
          );
        });
    })();

    // avoid clicks to create project widget to close drawer
    const createProject = (
      <div onClick={(e) => { e.stopPropagation(); }} style={{ width: '100%', padding: '16px' }}>
        <CreateProject
          className="project-list__input"
          team={props.team}
          onCreate={this.handleToggleDrawer}
          onBlur={props.handleAddProj}
          autofocus
        />
      </div>
    );

    const styles = {
      projectsList: {
        maxHeight: 'calc(100vh - 310px)',
        overflow: 'auto',
      },
    };

    return (
      <div>
        <div style={styles.projectsList}>
          <InfiniteScroll hasMore loadMore={this.loadMore.bind(this)} useWindow={false}>
            <Link to={`/${props.team.slug}/search`} className="project-list__link-all">
              <MenuItem
                className="project-list__item-all"
                primaryText={<FormattedMessage id="projects.allClaims" defaultMessage="All claims" />}
              />
            </Link>
            {projectList}
          </InfiniteScroll>
        </div>
        { props.handleAddProj && !props.showAddProj ?
          <Can permissions={props.team.permissions} permission="create Project">
            <Tooltip
              title={this.props.intl.formatMessage(props.showAddProj ?
                messages.dismiss : messages.addProject)}
            >
              <Button onClick={props.handleAddProj} className="drawer__create-project-button">
                <FormattedMessage id="projects.newList" defaultMessage="+ New list" />
              </Button>
            </Tooltip>
          </Can> : null
        }
        { props.showAddProj ? createProject : null }
      </div>
    );
  }
}

const DrawerProjectsContainer = Relay.createContainer(injectIntl(DrawerProjectsComponent), {
  initialVariables: {
    pageSize,
  },
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        slug,
        permissions,
        projects(first: $pageSize) {
          edges {
            node {
              title,
              dbid,
              id,
              search_id,
              medias_count,
            }
          }
        }
      }
    `,
  },
});

const DrawerProjects = (props) => {
  const route = new TeamRoute({ teamSlug: props.team });
  return (
    <RelayContainer
      Component={DrawerProjectsContainer}
      route={route}
      renderFetched={data => <DrawerProjectsContainer {...props} {...data} />}
    />
  );
};

export default DrawerProjects;
