/* eslint-disable react/sort-prop-types */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import ProjectsListCounter from '../drawer/Projects/ProjectsListCounter';

const ArticlesListCounter = ({ defaultFilters, teamSlug, type }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ArticleCoreListCounterQuery($slug: String!, $type: String!, $imported: Boolean, $report_status: [String], $trashed: Boolean) {
        team(slug: $slug) {
          articles_count(article_type: $type, imported: $imported, report_status: $report_status, trashed: $trashed)
          factChecksCount: articles_count(article_type: "fact-check")
          explainersCount: articles_count(article_type: "explainer")
          publishedCount: articles_count(article_type: "fact-check", report_status: "published")
          importedCount: articles_count(article_type: "fact-check", imported: true)
          trashCount: articles_count(trashed: true)
        }
      }
    `}
    render={({ props }) => {
      if (props) {
        let count = props.team.articles_count;
        // Use values that can be updated by the mutations when articles are created
        if (Object.keys(defaultFilters).length === 0) {
          if (type === 'fact-check') {
            if (defaultFilters.report_status === 'published') {
              count = props.team.publishedCount;
            } else if (defaultFilters.imported === true) {
              count = props.team.importedCount;
            } else {
              count = props.team.factChecksCount;
            }
          } else if (type === 'explainer') {
            count = props.team.explainersCount;
          } else {
            count = props.team.trashCount;
          }
        }
        return (<ProjectsListCounter key={count} numberOfItems={count} />);
      }
      return null;
    }}
    variables={{
      slug: teamSlug,
      type,
      ...defaultFilters,
    }}
  />
);

ArticlesListCounter.defaultProps = {
  defaultFilters: {},
  type: null,
};

ArticlesListCounter.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['explainer', 'fact-check']),
  defaultFilters: PropTypes.object,
};

export default ArticlesListCounter;
