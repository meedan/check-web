import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import Can from '../Can';
import ProjectRoute from '../../relay/ProjectRoute';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';

const messages = defineMessages({
  description: {
    id: 'projectHeader.description',
    defaultMessage: 'Verification Project'
  }
});

class ProjectHeaderComponent extends Component {
  render() {
    const project = this.props.project;

    return (
      <div className="project-header">
        <div className="project-header__copy">
          <h2 className="project-header__title">{project.title}</h2>
          <div className="project-header__description">
            <span className='project-header__description-summary'>{project.description || this.props.intl.formatMessage(messages.description)}</span>
            { project.description ? <span className='project-header__description-fulltext'>{project.description}</span> : null }
          </div>
        </div>
      </div>
    );
  }
}

ProjectHeaderComponent.PropTypes = {
  intl: intlShape.isRequired
};

ProjectHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const ProjectHeaderContainer = Relay.createContainer(injectIntl(ProjectHeaderComponent), {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id,
        dbid,
        title,
        description,
        permissions,
        get_slack_channel,
        team {
          id,
          dbid,
          slug,
          permissions,
          get_slack_notifications_enabled
        }
      }
    `,
  },
});


class ProjectHeader extends Component {
  render() {
    const route = new ProjectRoute({ contextId: this.props.params.projectId });
    return (<Relay.RootContainer Component={ProjectHeaderContainer} route={route} />);
  }
}

export default ProjectHeader;
