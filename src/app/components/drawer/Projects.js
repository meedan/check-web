import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import Button from '@material-ui/core/Button';
import MenuItem from 'material-ui/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';
import Can from '../Can';
import CreateProject from '../project/CreateProject';
import TeamRoute from '../../relay/TeamRoute';
import RelayContainer from '../../relay/RelayContainer';
import CheckContext from '../../CheckContext';

import {
  Text,
  body1,
  highlightOrange,
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

const StyledListItemAll = styled.div`
  .project-list__link-all {
    text-decoration: none!important;
    .project-list__item-all {
      font: ${body1}!important;
      min-height: 32px!important;
      height: 48px!important;
      line-height: 28px!important;
      padding-top: 16px!important;
      &:hover {
      background-color: white!important;
      color: ${highlightOrange}!important;
      }
    }
  }
`;


const StyledListItem = styled.div`

  .project-list__link {
    text-decoration: none!important;

    .project-list__item {
      font: ${body1}!important;
      min-height: 32px!important;
      height: 32px!important;
      line-height: 28px!important;
      &:hover {
      background-color: white!important;
      color: ${highlightOrange}!important;
      }
    }
  }

`;

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class DrawerProjectsComponent extends Component {
  state = {
    showCreateProject: false,
  };

  componentDidMount() {
    this.subscribe();
  }

  componentWillUpdate(nextProps) {
    if (this.props.team && this.props.team.dbid !== nextProps.team.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.team && this.props.team.dbid !== prevProps.team.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  subscribe() {
    const { pusher } = this.getContext();
    if (pusher && this.props.team) {
      pusher.subscribe(this.props.team.pusher_channel).bind('media_updated', 'Projects', (data, run) => {
        if (this.getContext().clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `projects-drawer-${this.props.team.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
      pusher.subscribe(this.props.team.pusher_channel).bind('project_updated', 'Projects', (data, run) => {
        if (this.getContext().clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `projects-drawer-${this.props.team.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher } = this.getContext();
    if (pusher && this.props.team) {
      pusher.unsubscribe(this.props.team.pusher_channel, 'media_updated', 'Projects');
      pusher.unsubscribe(this.props.team.pusher_channel, 'project_updated', 'Projects');
    }
  }

  loadMore() {
    this.props.relay.setVariables({ pageSize: this.props.team.projects.edges.length + pageSize });
  }

  toggleShowCreateProject = () => {
    this.setState({ showCreateProject: !this.state.showCreateProject });
  };

  render() {
    const { props } = this;
    const projectList = (() =>
      props.team.projects.edges
        .sortp((a, b) => a.node.title.localeCompare(b.node.title))
        .map((p) => {
          const dashboardPath = /^\/[^/]+\/dashboard/.test(window.location.pathname) ? '/dashboard' : '';
          const projectPath = `/${props.team.slug}${dashboardPath}/project/${p.node.dbid}`;
          return (
            <StyledListItem className="project-list__link-container">
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
            </StyledListItem>
          );
        })
    )();

    const styles = {
      projectsList: {
        maxHeight: 'calc(100vh - 310px)',
        overflow: 'auto',
      },
    };

    return (
      <div className="projects__list">
        <div style={styles.projectsList}>
          <InfiniteScroll hasMore loadMore={this.loadMore.bind(this)} useWindow={false}>
            <StyledListItemAll>
              <Link to={`/${props.team.slug}/all-items`} className="project-list__link-all">
                <MenuItem
                  className="project-list__item-all"
                  primaryText={<FormattedMessage id="projects.allClaims" defaultMessage="All items" />}
                  secondaryText={String(props.team.medias_count)}
                />
              </Link>
            </StyledListItemAll>
            {projectList}
          </InfiniteScroll>
        </div>
        <Can permissions={props.team.permissions} permission="create Project">
          <Tooltip
            title={this.props.intl.formatMessage(props.showAddProj ?
              messages.dismiss : messages.addProject)}
          >
            <Button
              onClick={this.toggleShowCreateProject}
              className="drawer__create-project-button"
              style={{
                fontSize: '12px',
                marginLeft: '5px',
                paddingLeft: '10px',
                paddingRight: '10px',
              }}
            >
              <FormattedMessage id="projects.newList" defaultMessage="+ New list" />
            </Button>
          </Tooltip>
        </Can>
        { this.state.showCreateProject ?
          <div style={{ width: '100%', padding: '16px' }}>
            <CreateProject
              className="project-list__input"
              team={props.team}
              onCreate={this.toggleShowCreateProject}
              onBlur={this.toggleShowCreateProject}
              autoFocus
            />
          </div>
          : null }
      </div>
    );
  }
}

DrawerProjectsComponent.contextTypes = {
  store: PropTypes.object,
};

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
        medias_count,
        pusher_channel,
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
