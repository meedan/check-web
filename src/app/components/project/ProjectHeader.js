import React, { Component } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import ProjectRoute from '../../relay/ProjectRoute';
import { black54, subheading2, ellipsisStyles } from '../../styles/js/variables';

class ProjectHeaderComponent extends Component {

  render() {
    const currentProject = this.props.project;

    const Title = styled.h3`
      font: ${subheading2};
      color: ${black54};
      ${ellipsisStyles}
    `;

    const isProjectSubpage = path.length > backUrl.length;
    return (
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

        {isProjectSubpage
          ? <IconButton
            containerElement={<Link to={backUrl} />}
            className="project-header__back-button"
          >
            <IconArrowBack color={black54} />
          </IconButton>
          : null}

        <DropDownMenu
          underlineStyle={{ borderWidth: 0 }}
          iconStyle={{ fill: black54 }}
          value={currentProject.title}
          className="project-header__title"
          style={{ marginTop: `${units(1)}`, minWidth: 130, maxWidth: '50%', overflow: 'hidden' }}
          labelStyle={{ paddingLeft: '0' }}
        >
          {currentProject.team.projects.edges
            .sortp((a, b) => a.node.title.localeCompare(b.node.title))
            .map((p) => {
              const projectPath = `/${currentProject.team.slug}/project/${p.node.dbid}`;
              return (
                <MenuItem
                  href={projectPath}
                  key={p.node.dbid}
                  value={p.node.title}
                  primaryText={p.node.title}
                  className="project-list__project"
                  style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                />
              );
            })}
        </DropDownMenu>
      </div>
    );
  }
}

ProjectHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectHeaderContainer = Relay.createContainer(ProjectHeaderComponent, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        title,
        description
      }
    `,
  },
});

class ProjectHeader extends Component {
  render() {
    if (this.props.params && this.props.params.projectId) {
      const route = new ProjectRoute({ contextId: this.props.params.projectId });
      return (<Relay.RootContainer
        Component={ProjectHeaderContainer}
        route={route}
      />);
    }
    return null;
  }
}

export default ProjectHeader;
