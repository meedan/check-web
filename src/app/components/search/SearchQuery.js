import React from 'react';
import { injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import isEqual from 'lodash.isequal';
import SearchQueryComponent from './SearchQueryComponent';
import TeamNodeRoute from '../../relay/TeamNodeRoute';

const queryWithoutProjects = Relay.QL`
  fragment on Team {
    id,
    dbid,
    verification_statuses,
    teamwide_tags(first: 10000) {
      edges {
        node {
          text
        }
      }
    },
    pusher_channel,
    dynamic_search_fields_json_schema,
    rules_search_fields_json_schema,
    name,
    slug,
  }
`;

const queryWithProjects = Relay.QL`
  fragment on Team {
    id,
    dbid,
    verification_statuses,
    teamwide_tags(first: 10000) {
      edges {
        node {
          text
        }
      }
    },
    pusher_channel,
    dynamic_search_fields_json_schema,
    rules_search_fields_json_schema,
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

    // eslint-disable-next-line no-underscore-dangle
    const queryRoute = new TeamNodeRoute({ id: this.props.team.__dataID__ });

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
