import React from 'react';
import { injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import isEqual from 'lodash.isequal';
import SearchQueryComponent from './SearchQueryComponent';
import TeamRoute from '../../relay/TeamRoute';

const queryWithoutProjects = Relay.QL`
  fragment on Team {
    id,
    dbid,
    verification_statuses,
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
    verification_statuses,
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

class SearchQuery extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState) ||
           !isEqual(this.props, nextProps);
  }

  render() {
    const gqlquery = this.props.project ? queryWithoutProjects : queryWithProjects;

    const SearchQueryContainer = Relay.createContainer(injectIntl(SearchQueryComponent), {
      fragments: {
        team: () => gqlquery,
      },
    });

    const { teamSlug } = this.props;
    const queryRoute = new TeamRoute({ teamSlug });

    return (
      <Relay.RootContainer
        Component={SearchQueryContainer}
        route={queryRoute}
        renderFetched={data => <SearchQueryContainer {...this.props} {...data} />}
      />
    );
  }
}

export default SearchQuery;
