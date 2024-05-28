import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import ProjectsListCounter from '../drawer/Projects/ProjectsListCounter';

const ArticlesListCounter = ({ teamSlug, type }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ArticleCoreListCounterQuery($slug: String!, $type: String!) {
        team(slug: $slug) {
          articles_count(article_type: $type)
        }
      }
    `}
    variables={{
      slug: teamSlug,
      type,
    }}
    render={({ props }) => {
      if (props) {
        return (<ProjectsListCounter numberOfItems={props.team.articles_count} />);
      }
      return null;
    }}
  />
);

ArticlesListCounter.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
};

export default ArticlesListCounter;
