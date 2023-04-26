/* eslint-disable @calm/react-intl/missing-attribute */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { withStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import { withPusher, pusherShape } from '../pusher';
import DrawerProjects from './drawer/Projects';
import CheckContext from '../CheckContext';
import DeleteIcon from '../icons/delete.svg';
import ReportIcon from '../icons/report.svg';
import styles from './drawer/Drawer.module.css';
import projectStyles from './drawer/Projects/Projects.module.css';

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class DrawerNavigationComponent extends Component {
  componentDidMount() {
    this.subscribe();
    this.setContextTeam();
  }

  componentWillUpdate(nextProps) {
    if (this.props.team && this.props.team?.dbid !== nextProps.team?.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    this.setContextTeam();
    if (this.props.team && this.props.team?.dbid !== prevProps.team?.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  setContextTeam() {
    const context = new CheckContext(this);
    const { team } = this.props;
    if (team) {
      team.id = team.team_graphql_id;
      context.setContextStore({ team });
    }
  }

  handleSpam = () => {
    // setActiveItem({ type: 'spam', id: null });
    browserHistory.push(`/${this.props.team.slug}/spam`);
  }

  handleTrash = () => {
    // setActiveItem({ type: 'spam', id: null });
    browserHistory.push(`/${this.props.team.slug}/trash`);
  }

  subscribe() {
    const { pusher, clientSessionId, team } = this.props;
    if (pusher && team) {
      pusher.subscribe(team.pusher_channel).bind('media_updated', 'DrawerNavigationComponent', (data, run) => {
        if (clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `drawer-navigation-component-${team.dbid}`,
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
      pusher.unsubscribe(team.pusher_channel, 'media_updated', 'DrawerNavigationComponent');
    }
  }

  render() {
    const {
      team, classes, drawerOpen,
    } = this.props;

    // This component now renders based on teamPublicFragment
    // and decides whether to include <Project> which has its own team route/relay
    //
    // See DrawerNavigation
    //
    // — @chris with @alex 2017-10-3

    return (
      <Drawer
        className={[styles.drawer, drawerOpen ? styles.drawerOpen : styles.drawerClosed].join(' ')}
        open={Boolean(drawerOpen)}
        variant="persistent"
        anchor="left"
        classes={classes}
      >
        <React.Fragment>
          <DrawerProjects team={team.slug} />
          <List dense className={[projectStyles.projectsComponentList, projectStyles.projectsComponentListFooer].join(' ')}>
            <ListItem
              button
              onClick={this.handleSpam}
              className={['project-list__link-spam', projectStyles.projectsListItem].join(' ')}
            >
              <div className={projectStyles.projectsListItemIcon}>
                <ReportIcon />
              </div>
              <ListItemText disableTypography className={projectStyles.projectsListItemLabel}>
                <FormattedMessage tagName="label" id="projects.spam" defaultMessage="Spam" />
              </ListItemText>
              <ListItemSecondaryAction disableTypography title={team.medias_count} className={projectStyles.projectsListItemCount}>
                {String(team.spam_count)}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem
              button
              onClick={this.handleTrash}
              className={['project-list__link-trasn', projectStyles.projectsListItem].join(' ')}
            >
              <div className={projectStyles.projectsListItemIcon}>
                <DeleteIcon />
              </div>
              <ListItemText disableTypography className={projectStyles.projectsListItemLabel}>
                <FormattedMessage tagName="label" id="projects.trash" defaultMessage="Trash" />
              </ListItemText>
              <ListItemSecondaryAction disableTypography title={team.trash_count} className={projectStyles.projectsListItemCount}>
                {String(team.trash_count)}
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </React.Fragment>
      </Drawer>
    );
  }
}

DrawerNavigationComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
};

DrawerNavigationComponent.contextTypes = {
  store: PropTypes.object,
};

const drawerStyles = {
  paper: {
    overflow: 'hidden',
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
};

export default withStyles(drawerStyles)(withPusher(DrawerNavigationComponent));
