import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Relay from 'react-relay';
import { Link } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import MdAddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline';
import MdHighlightOff from 'material-ui/svg-icons/action/highlight-off';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import Can from '../Can';
import CreateProject from '../project/CreateProject';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';

import {
  Row,
  Text,
  black54,
  units,
  caption,
} from '../../styles/js/shared';

const SubHeading = styled.div`
  font: ${caption};
  color: ${black54};
  padding: ${units(2)} ${units(2)} ${units(1)} ${units(2)};
`;

const StyledAddProj = styled.div`
  display: flex;
  align-items: center;
  margin-${props => props.isRtl ? 'right' : 'left'}: auto;
  float: ${props => props.isRtl ? 'left' : 'right'};
  span {
    margin-${props => props.isRtl ? 'left' : 'right'}: ${units(1)};
  }
`;

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
const DrawerProjectsComponent = (props) => {
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
          <Link to={projectPath} key={p.node.dbid} >
            <MenuItem primaryText={<Text ellipsis>{p.node.title}</Text>} />
          </Link>
        );
      });
  })();

  // avoid clicks to create project widget to close drawer
  const createProject = (
    <div onClick={(e) => { e.stopPropagation(); }} style={{ width: '100%', padding: '16px' }}>
      <CreateProject className="project-list__input" team={props.team} autofocus />
    </div>
  );

  return (
    <div>
      <SubHeading>
        <Row>
          <FormattedMessage
            id="projects.projectsSubheading"
            defaultMessage="Projects"
          />
          { props.handleAddProj &&
            <Can permissions={props.team.permissions} permission="create Project">
              <StyledAddProj
                style={{ cursor: 'pointer' }}
                onClick={props.handleAddProj}
                isRtl={rtlDetect.isRtlLang(props.intl.locale)}
                className="drawer__create-project-button"
              >
                { props.team.projects.edges.length > 0 ?
                  <span style={{ color: black54, font: caption }}>PRO</span>
                  : null
                }
                { props.showAddProj ? <MdHighlightOff /> : <MdAddCircleOutline /> }
              </StyledAddProj>
            </Can>
          }
        </Row>
      </SubHeading>
      <div>
        { props.showAddProj ? createProject : projectList }
      </div>
    </div>
  );
};

const DrawerProjectsContainer = Relay.createContainer(injectIntl(DrawerProjectsComponent), {
  initialVariables: {
    pageSize: 10000,
  },
  fragments: {
    team: () => teamFragment,
  },
});

const DrawerProjects = (props) => {
  const route = new TeamRoute({ teamSlug: props.team });
  return (
    <Relay.RootContainer
      Component={DrawerProjectsContainer}
      route={route}
      renderFetched={data => <DrawerProjectsContainer {...props} {...data} />}
    />
  );
};

export default DrawerProjects;
