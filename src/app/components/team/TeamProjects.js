import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import styled from 'styled-components';
import CreateProject from '../project/CreateProject';
import Can from '../Can';
import MappedMessage from '../MappedMessage';
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

  render() {
    const StyledCardHeader = styled(CardHeader)`
      span {
        font: ${title1} !important;
      }
    `;

    const { team } = this.props;

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
                    <Link key={p.node.dbid} to={`/${team.slug}/project/${p.node.dbid}`}>
                      <ListItem
                        className="team__project"
                        hoverColor={highlightBlue}
                        focusRippleColor={checkBlue}
                        touchRippleColor={checkBlue}
                        primaryText={p.node.title}
                        rightIcon={<KeyboardArrowRight />}
                      />
                    </Link>
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

export default injectIntl(TeamProjects);
