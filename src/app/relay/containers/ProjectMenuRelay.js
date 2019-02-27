import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import IconEdit from 'material-ui/svg-icons/image/edit';
import ViewListIcon from '@material-ui/icons/ViewList';
import ViewComfyIcon from '@material-ui/icons/ViewComfy';
import ProjectRoute from '../ProjectRoute';
import Can from '../../components/Can';
import CheckContext from '../../CheckContext';
import { Row, SmallerStyledIconButton } from '../../styles/js/shared';

class ProjectMenu extends Component {
  handleEditClick() {
    const { history } = new CheckContext(this).getContextStore();
    history.push(`${window.location.pathname.match(/.*\/project\/\d+/)[0]}/edit`);
  }

  handleToggleViewClick() {
    const { history } = new CheckContext(this).getContextStore();
    if (this.props.children.props.route.view === 'dense') {
      history.push(window.location.pathname.replace('/dense', ''));
    } else {
      history.push(`${window.location.pathname.match(/.*\/project\/\d+/)[0]}/dense`);
    }
  }

  render() {
    const { project } = this.props;

    const editProjectButton = (
      <SmallerStyledIconButton
        onClick={this.handleEditClick.bind(this)}
        tooltip={<FormattedMessage id="projectMenuRelay.editProject" defaultMessage="Edit project" />}
      >
        <IconEdit />
      </SmallerStyledIconButton>
    );

    const viewIcon = this.props.children.props.route.view === 'dense' ?
      <ViewListIcon /> : <ViewComfyIcon />;

    const viewTooltip = this.props.children.props.route.view === 'dense'
      ? <FormattedMessage id="projectMenuRelay.listView" defaultMessage="List view" />
      : <FormattedMessage id="projectMenuRelay.denseView" defaultMessage="Dense view" />;

    const toggleViewButton = (
      <SmallerStyledIconButton
        onClick={this.handleToggleViewClick.bind(this)}
        tooltip={viewTooltip}
      >
        {viewIcon}
      </SmallerStyledIconButton>
    );

    return (
      <Row>
        {toggleViewButton}
        <Can permissions={project.permissions} permission="update Project">
          <div
            key="projectMenuRelay.editProject"
            className="project-menu"
          >
            {editProjectButton}
          </div>
        </Can>
      </Row>
    );
  }
}

ProjectMenu.contextTypes = {
  store: PropTypes.object,
};

const ProjectMenuContainer = Relay.createContainer(ProjectMenu, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        team {
          id,
          dbid,
          slug,
          permissions,
          limits
        }
      }
    `,
  },
});

const ProjectMenuRelay = (props) => {
  const { mediaId, sourceId } = props.params;
  if (mediaId || sourceId) {
    return null;
  }
  if (props.params && props.params.projectId) {
    const route = new ProjectRoute({ contextId: props.params.projectId });
    return (
      <Relay.RootContainer
        Component={ProjectMenuContainer}
        route={route}
        renderFetched={data => <ProjectMenuContainer {...props} {...data} />}
      />
    );
  }
  return null;
};

export default ProjectMenuRelay;
