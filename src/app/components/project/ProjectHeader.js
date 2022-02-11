/* eslint-disable @calm/react-intl/missing-attribute */
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
    const {
      params,
      project,
      saved_search,
      location,
    } = this.props;
    const { listUrl } = getListUrlQueryAndIndex(params, location.query, location.pathname);
    const isTrendsPage = /\/trends(\/|$)/.test(listUrl);

    let pageTitle;
    if (/\/trash(\/|$)/.test(listUrl)) {
      pageTitle = <FormattedMessage id="projectHeader.trash" defaultMessage="Trash" />;
    } else if (/\/unconfirmed(\/|$)/.test(listUrl)) {
      pageTitle = <FormattedMessage id="projectHeader.unconfirmed" defaultMessage="Unconfirmed" />;
    } else if (/\/tipline-inbox(\/|$)/.test(listUrl)) {
      pageTitle = <FormattedMessage id="projectHeader.tiplineInbox" defaultMessage="Tipline inbox" />;
    } else if (/\/imported-reports(\/|$)/.test(listUrl)) {
      pageTitle = <FormattedMessage id="projectHeader.importedReports" defaultMessage="Imported reports" />;
    } else if (/\/suggested-matches(\/|$)/.test(listUrl)) {
      pageTitle = <FormattedMessage id="projectHeader.suggestedMatches" defaultMessage="Suggested matches" />;
    } else if (isTrendsPage) {
      pageTitle = <FormattedMessage id="projectHeader.trends" defaultMessage="Trends" />;
    } else if (project) {
      pageTitle = project.title;
    } else if (saved_search) {
      pageTitle = saved_search.title;
    } else {
      pageTitle = <FormattedMessage id="projectHeader.allItems" defaultMessage="All items" />;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <Row>
          <IconButton onClick={() => isTrendsPage ? browserHistory.goBack() : browserHistory.push(listUrl)} className="project-header__back-button">
            <ArrowBackIcon />
          </IconButton>
          <HeaderTitle className="project-header__title" style={{ maxWidth: 300 }} title={pageTitle}>
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
  let query = null;

  if (params.projectId) {
    query = graphql`
      query ProjectHeaderProjectQuery($projectId: String!) {
        project(id: $projectId) {
          ...ProjectHeaderContainer_project
        }
      }
    `;
  } else if (params.listId) {
    query = graphql`
      query ProjectHeaderListQuery($listId: ID!) {
        saved_search(id: $listId) {
          title
        }
      }
    `;
  }

  if (params.projectId || params.listId) {
    return (
      <QueryRenderer
        environment={Relay.Store}
        query={query}
        variables={{ projectId: params.projectId, listId: params.listId }}
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
