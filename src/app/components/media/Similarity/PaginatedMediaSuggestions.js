/* eslint-disable relay/unused-fields */
import React from 'react';
import { createPaginationContainer, graphql } from 'react-relay/compat';
import MediaSuggestionsComponent from './MediaSuggestionsComponent';
import MediaSimilaritiesComponent from './MediaSimilaritiesComponent'; // eslint-disable-line no-unused-vars

// Query that is called for subsequent "load more" pagination calls
// In theory this is the same as MediaSuggestionsQuery and is duplicate code
// but it seems that quirks of relay's compiler means we can't just
// pass in MediaSuggestionsQuery. And it's not a fragment so we can't reference it
const mediaSuggestionsQuery = graphql`
  query PaginatedMediaSuggestionsQuery($ids: String!, $pageSize: Int!, $after: String) {
    project_media(ids: $ids) {
      ...MediaSimilaritiesComponent_projectMedia
      id
      dbid
      report_type
      confirmedSimilarCount: confirmed_similar_items_count
      demand
      ...PaginatedMediaSuggestions_root
      team {
        slug
        dbid
        smooch_bot: team_bot_installation(bot_identifier: "smooch") {
          id
        }
        permissions
      }
    }
  }
`;

const PaginatedMediaSuggestions = createPaginationContainer(
  props => (
    <MediaSuggestionsComponent
      mainItem={props.parentProps.project_media}
      reportType={props.parentProps.project_media.report_type}
      demand={props.parentProps.project_media.demand}
      key={props.parentProps.project_media.confirmedSimilarCount}
      team={props.parentProps.project_media.team}
      relationships={props.root.suggested_similar_relationships ? props.root.suggested_similar_relationships?.edges.map(r => r.node) : []}
      pageSize={props.pageSize}
      totalCount={props.root.suggested_similar_relationships?.totalCount}
      relay={props.relay}
    />
  ),
  {
    root: graphql`
      fragment PaginatedMediaSuggestions_root on ProjectMedia {
        suggested_similar_relationships(first: $pageSize, after: $after) @connection(key: "PaginatedMediaSuggestions_suggested_similar_relationships"){
          edges {
            node {
              id
              target_id
              target {
                id
                dbid
                project_id
                created_at
                last_seen
                title
                description
                picture
                type
                requests_count
                report_status
                domain
                url
                media {
                  url
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    `,
  },
  {
    direction: 'forward',
    query: mediaSuggestionsQuery,
    getConnectionFromProps: props => props.root.suggested_similar_relationships,
    getFragmentVariables: (previousVars, pageSize) => ({
      ...previousVars,
      pageSize,
    }),
    getVariables: (props, paginationInfo, fragmentVariables) => ({
      pageSize: fragmentVariables.pageSize,
      ids: fragmentVariables.ids,
      after: paginationInfo.cursor,
    }),
  },
);

export default PaginatedMediaSuggestions;
