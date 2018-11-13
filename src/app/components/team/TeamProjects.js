import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import styled from 'styled-components';
import CreateProject from '../project/CreateProject';
import ProjectAssignment from '../project/ProjectAssignment';
import CheckContext from '../../CheckContext';
import Can from '../Can';
import MappedMessage from '../MappedMessage';
import UserUtil from '../user/UserUtil';
import LoadMore from '../layout/LoadMore';
import {
  highlightBlue,
  checkBlue,
  title1,
  units,
  black54,
} from '../../styles/js/shared';

const messages = defineMessages({
  verificationProjects: {
    id: 'teamComponent.title',
    defaultMessage: 'Verification Projects',
  },
  bridge_verificationProjects: {
    id: 'bridge.teamComponent.title',
    defaultMessage: 'Translation Projects',
  },
});

const pageSize = 20;

class TeamProjects extends React.Component {
  loadMore() {
    this.props.relay.setVariables({ pageSize: this.props.team.projects.edges.length + pageSize });
  }

  goToProject(pdbid) {
    browserHistory.push(`/${this.props.team.slug}/project/${pdbid}`);
  }

  currentContext() {
    return new CheckContext(this).getContextStore();
  }

  render() {
    const StyledCardHeader = styled(CardHeader)`
      span {
        font: ${title1} !important;
      }
    `;

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
          <StyledCardHeader
            title={<MappedMessage msgObj={messages} msgKey="verificationProjects" />}
          />

          {!team.projects.edges.length ?
            <CardText style={{ color: black54 }}>
              <FormattedMessage id="teamComponent.noProjects" defaultMessage="No projects yet" />
            </CardText>
            :
            <LoadMore
              hasMore={team.projects.edges.length < team.projects_count}
              loadMore={this.loadMore.bind(this)}
            >
              <List
                className="projects"
                style={{ maxHeight: '500px', overflow: 'auto' }}
              >
                {team.projects.edges
                  .sortp((a, b) => a.node.title.localeCompare(b.node.title))
                  .map(p => (
                    <ListItem
                      key={p.node.dbid}
                      className="team__project"
                      hoverColor={highlightBlue}
                      focusRippleColor={checkBlue}
                      touchRippleColor={checkBlue}
                      primaryText={
                        <span className="team__project-title">
                          {p.node.title}
                        </span>
                      }
                      secondaryText={
                        <div>
                          <small>
                            { UserUtil.myRole(currentUser, team.slug) !== 'annotator' ?
                              <FormattedMessage
                                id="teamComponent.projectAssignmentsCount"
                                defaultMessage="{count, plural, =0 {Not assigned to any user} one {Assigned to one user} other {Assigned to # users}}"
                                values={{ count: p.node.assignments_count }}
                              /> : null }
                          </small>
                        </div>
                      }
                      onClick={this.goToProject.bind(this, p.node.dbid)}
                      nestedItems={[
                        <ProjectAssignment project={p.node} key={p.node.dbid} />,
                      ]}
                    />
                  ))
                }
              </List>
            </LoadMore>
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
