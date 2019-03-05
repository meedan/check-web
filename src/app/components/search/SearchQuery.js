import React from 'react';
import { injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import SearchQueryComponent from './SearchQueryComponent';
import TeamRoute from '../../relay/TeamRoute';

const queryWithoutProjects = Relay.QL`
  fragment on Team {
    id,
    dbid,
    media_verification_statuses,
    translation_statuses,
    get_suggested_tags,
    dynamic_search_fields_json_schema,
    name,
    slug,
  }
`;

const queryWithProjects = Relay.QL`
  fragment on Team {
    id,
    dbid,
    media_verification_statuses,
    translation_statuses,
    get_suggested_tags,
    dynamic_search_fields_json_schema,
    name,
    slug,
    projects(first: 10000) {
      edges {
        node {
          title,
          dbid,
          id,
          description
        }
      }
    }
  }
`;

const SearchQuery = (props) => {
  const gqlquery = props.project ? queryWithoutProjects : queryWithProjects;

  const SearchQueryContainer = Relay.createContainer(injectIntl(SearchQueryComponent), {
    fragments: {
      team: () => gqlquery,
    },
  });

  const { teamSlug } = props;
  const queryRoute = new TeamRoute({ teamSlug });

  return (
    <Relay.RootContainer
      Component={SearchQueryContainer}
      route={queryRoute}
      renderFetched={data => <SearchQueryContainer {...props} {...data} />}
    />
  );
};

export default SearchQuery;
