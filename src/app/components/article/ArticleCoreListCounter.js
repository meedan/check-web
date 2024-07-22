import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import ProjectsListCounter from '../drawer/Projects/ProjectsListCounter';

const ArticlesListCounter = ({ teamSlug, type, defaultFilters }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ArticleCoreListCounterQuery($slug: String!, $type: String!, $imported: Boolean, $report_status: [String]) {
        team(slug: $slug) {
          articles_count(article_type: $type, imported: $imported, report_status: $report_status)
          factChecksCount: articles_count(article_type: "fact-check")
          explainersCount: articles_count(article_type: "explainer")
        }
      }
    `}
    variables={{
      slug: teamSlug,
      type,
      ...defaultFilters,
    }}
    render={({ props }) => {
      if (props) {
        let count = props.team.articles_count;
        // Use values that can be updated by the mutations when articles are created
        if (Object.keys(defaultFilters).length === 0) {
          if (type === 'fact-check') {
            count = props.team.factChecksCount;
          } else if (type === 'explainer') {
            count = props.team.explainersCount;
          }
        }
        return (<ProjectsListCounter key={count} numberOfItems={count} />);
      }
      return null;
    }}
  />
);

ArticlesListCounter.defaultProps = {
  defaultFilters: {},
};

ArticlesListCounter.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
  defaultFilters: PropTypes.object,
};

export default ArticlesListCounter;
