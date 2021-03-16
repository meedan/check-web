import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import { FormattedMessage } from 'react-intl';
import { getListUrlQueryAndIndex } from '../../urlHelpers';
import { Row, Text, HeaderTitle } from '../../styles/js/shared';

class ProjectHeaderComponent extends React.PureComponent {
  render() {
    const { params, project, location } = this.props;
    const { listUrl } = getListUrlQueryAndIndex(params, location.query);

    let pageTitle;
    if (/\/trash(\/|$)/.test(listUrl)) {
      pageTitle = <FormattedMessage id="projectHeader.trash" defaultMessage="Trash" />;
    } else if (project) {
      pageTitle = project.title;
    } else {
      pageTitle = <FormattedMessage id="projectHeader.allItems" defaultMessage="All items" />;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <Row>
          <IconButton onClick={() => browserHistory.push(listUrl)} className="project-header__back-button">
            <ArrowBackIcon />
          </IconButton>
          <HeaderTitle className="project-header__title" style={{ maxWidth: '100%' }}>
            <Text ellipsis>
              {pageTitle}
            </Text>
          </HeaderTitle>
        </Row>
      </div>
    );
  }
}
ProjectHeaderComponent.defaultProps = {
  project: null,
};
ProjectHeaderComponent.propTypes = {
  params: PropTypes.object.isRequired,
  location: PropTypes.shape({ query: PropTypes.object.isRequired }).isRequired,
  project: PropTypes.shape({ title: PropTypes.string.isRequired }), // or null
};

const ProjectHeaderContainer = createFragmentContainer(ProjectHeaderComponent, graphql`
  fragment ProjectHeaderContainer_project on Project {
    title
  }
`);

const ProjectPlaceholder = { title: '' };

const ProjectHeader = ({ location, params }) => {
  const commonProps = { location, params };

  if (params.projectId) {
    return (
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query ProjectHeaderQuery($projectId: String!) {
            project(id: $projectId) {
              ...ProjectHeaderContainer_project
            }
          }
        `}
        variables={{ projectId: params.projectId }}
        render={({ props }) => (
          props
            ? <ProjectHeaderContainer {...commonProps} {...props} />
            : <ProjectHeaderComponent {...commonProps} project={ProjectPlaceholder} />
        )}
      />
    );
  }

  return <ProjectHeaderComponent {...commonProps} />;
};

export default ProjectHeader;
