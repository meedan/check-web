import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CreateProject from '../project/CreateProject';
import ProjectAssignment from '../project/ProjectAssignment';
import CheckContext from '../../CheckContext';
import Can from '../Can';
import UserUtil from '../user/UserUtil';
import LoadMore from '../layout/LoadMore';
import {
  highlightBlue,
  checkBlue,
  units,
  black05,
  black54,
} from '../../styles/js/shared';

const pageSize = 20;

class TeamProjects extends React.Component {
  state = {};

  goToProject(pdbid) {
    browserHistory.push(`/${this.props.team.slug}/project/${pdbid}`);
  }

  currentContext() {
    return new CheckContext(this).getContextStore();
  }

  toggleItemCollapse = (id) => {
    const state = Object.assign({}, this.state);
    state[id] = !state[id];
    this.setState(state);
  };

  render() {
    const { team } = this.props;
    const { currentUser } = this.currentContext();

    return (
      <div>
        <Can permissions={team.permissions} permission="create Project">
          <CreateProject
            team={team}
            autoFocus={!team.projects.edges.length}
            renderCard
          />
        </Can>
        <Card style={{ marginBottom: units(2) }}>
          <CardHeader
            title={<FormattedMessage id="teamComponent.projects" defaultMessage="Lists" />}
          />

          {!team.projects.edges.length ?
            <CardContent style={{ color: black54 }}>
              <FormattedMessage id="teamComponent.noProjects" defaultMessage="No lists" />
            </CardContent>
            :
            <List className="projects">
              <LoadMore
                relay={this.props.relay}
                pageSize={pageSize}
                currentSize={team.projects.edges.length}
                total={team.projects_count}
              >
                {team.projects.edges
                  .sortp((a, b) => a.node.title.localeCompare(b.node.title))
                  .map(p => (
                    <div>
                      <ListItem
                        key={p.node.dbid}
                        className="team__project"
                        hoverColor={highlightBlue}
                        focusRippleColor={checkBlue}
                        touchRippleColor={checkBlue}
                        onClick={this.goToProject.bind(this, p.node.dbid)}
                      >
                        <ListItemText
                          primary={
                            <span className="team__project-title">
                              {p.node.title}
                            </span>
                          }
                          secondary={
                            <small>
                              { UserUtil.myRole(currentUser, team.slug) !== 'annotator' ?
                                <FormattedMessage
                                  id="teamComponent.projectAssignmentsCount"
                                  defaultMessage="{count, plural, =0 {&nbsp;} one {Assigned to one member} other {Assigned to # members}}"
                                  values={{ count: p.node.assignments_count }}
                                /> : null }
                            </small>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            className="team__project-expand"
                            onClick={() => { this.toggleItemCollapse(p.node.dbid); }}
                          >
                            <KeyboardArrowDown />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Collapse in={this.state[p.node.dbid]} timeout="auto" unmountOnExit>
                        <div style={{ padding: `${units(1)} ${units(2)}`, backgroundColor: black05 }}>
                          <ProjectAssignment project={p.node} key={p.node.dbid} />
                        </div>
                      </Collapse>
                    </div>
                  ))
                }
              </LoadMore>
            </List>
          }
        </Card>
      </div>
    );
  }
}

TeamProjects.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(TeamProjects);
