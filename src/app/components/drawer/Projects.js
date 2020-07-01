import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber, injectIntl, defineMessages } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import Can from '../Can';
import { withPusher, pusherShape } from '../../pusher';
import CreateProject from '../project/CreateProject';
import TeamRoute from '../../relay/TeamRoute';
import RelayContainer from '../../relay/RelayContainer';

import { units } from '../../styles/js/shared';

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

const useProjectLinkStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    whiteSpace: 'nowrap',
  },

  title: {
    display: 'block',
    flex: '1 1 auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: theme.spacing(1),
  },

  count: {
    display: 'block',
    flex: '0 0 auto',
  },
}));

const ProjectListItemText = ({
  title, count, teamSlug, projectDbid,
}) => {
  const linkClasses = useProjectLinkStyles();

  // Not using <ListItemSecondaryAction> because it absorbs events, so clicking
  // the count wouldn't follow the link

  const to = projectDbid ? `/${teamSlug}/project/${projectDbid}` : `/${teamSlug}/all-items`;

  return (
    <ListItemText>
      <Link
        to={to}
        className={`${linkClasses.root} ${projectDbid ? 'project-list__link' : 'project-list__link-all'}`}
      >
        <span className={linkClasses.title}>{title}</span>
        <span className={linkClasses.count}><FormattedNumber value={count} /></span>
      </Link>
    </ListItemText>
  );
};

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

  subscribe() {
    const { pusher, clientSessionId, team } = this.props;
    if (pusher && team) {
      pusher.subscribe(team.pusher_channel).bind('media_updated', 'Projects', (data, run) => {
        if (clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `projects-drawer-${team.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
      pusher.subscribe(team.pusher_channel).bind('project_updated', 'Projects', (data, run) => {
        if (clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `projects-drawer-${team.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher, team } = this.props;
    if (pusher && team) {
      pusher.unsubscribe(team.pusher_channel, 'media_updated', 'Projects');
      pusher.unsubscribe(team.pusher_channel, 'project_updated', 'Projects');
    }
  }

  toggleShowCreateProject = () => {
    this.setState({ showCreateProject: !this.state.showCreateProject });
  };

  render() {
    const { team } = this.props;

    return (
      <div className="projects__list">
        <List dense>
          <ListItem>
            <ProjectListItemText
              teamSlug={team.slug}
              projectDbid={null}
              title={<FormattedMessage id="projects.allClaims" defaultMessage="All items" />}
              count={team.medias_count}
            />
          </ListItem>
          {team.projects.edges
            .map(({ node }) => node) // make copy of Array
            .sort((a, b) => a.title.localeCompare(b.title)) // mutate _copy_ of Array
            .map(({ dbid, title, medias_count }) => (
              <ListItem key={dbid}>
                <ProjectListItemText
                  teamSlug={team.slug}
                  projectDbid={dbid}
                  title={title}
                  count={medias_count}
                />
              </ListItem>
            ))
          }
        </List>
        <Can permissions={team.permissions} permission="create Project">
          <Tooltip
            title={this.props.intl.formatMessage(this.props.showAddProj ?
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
          <div style={{ width: '100%', padding: `0 ${units(2)}` }}>
            <CreateProject
              className="project-list__input"
              team={team}
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

DrawerProjectsComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

const ConnectedDrawerProjectsComponent = withPusher(injectIntl(DrawerProjectsComponent));

const DrawerProjectsContainer = Relay.createContainer(ConnectedDrawerProjectsComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        slug,
        permissions,
        medias_count,
        pusher_channel,
        projects(first: 10000) {
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
      renderFetched={data =>
        <DrawerProjectsContainer {...data} />}
    />
  );
};

export default DrawerProjects;
