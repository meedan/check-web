import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import MdAddCircleOutline from 'material-ui/svg-icons/content/add-circle-outline';
import MdHighlightOff from 'material-ui/svg-icons/action/highlight-off';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import InfiniteScroll from 'react-infinite-scroller';
import Can from '../Can';
import CreateProject from '../project/CreateProject';
import TeamRoute from '../../relay/TeamRoute';
import RelayContainer from '../../relay/RelayContainer';

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
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-${props => props.isRtl ? 'right' : 'left'}: auto;
  float: ${props => props.isRtl ? 'left' : 'right'};
  span {
    margin-${props => props.isRtl ? 'left' : 'right'}: ${units(1)};
  }
`;

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
                  <Text ellipsis>
                    {p.node.title}
                  </Text>
                }
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
          autofocus
        />
      </div>
    );

    const styles = {
      projectsList: {
        height: 'calc(100vh - 364px)',
        overflow: 'auto',
      },
    };

    return (
      <div>
        <SubHeading>
          <Row>
            <FormattedMessage
              id="projects.projectsSubheading"
              defaultMessage="Projects"
            />
            { props.handleAddProj ?
              <Can permissions={props.team.permissions} permission="create Project">
                <StyledAddProj
                  style={{ cursor: 'pointer' }}
                  onClick={props.handleAddProj}
                  isRtl={rtlDetect.isRtlLang(props.intl.locale)}
                  className="drawer__create-project-button"
                >
                  { props.showAddProj ? <MdHighlightOff /> : <MdAddCircleOutline /> }
                </StyledAddProj>
              </Can> : null
            }
          </Row>
        </SubHeading>
        <div>
          { props.showAddProj ?
            createProject
            :
            <div style={styles.projectsList}>
              <InfiniteScroll hasMore loadMore={this.loadMore.bind(this)} useWindow={false}>
                {projectList}
              </InfiniteScroll>
            </div>
          }
        </div>
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
