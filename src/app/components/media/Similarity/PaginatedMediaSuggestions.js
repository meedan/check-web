/* eslint-disable relay/unused-fields */
import React from 'react';
import { createPaginationContainer, graphql } from 'react-relay/compat';
import MediaSuggestionsComponent from './MediaSuggestionsComponent';
import MediaSimilaritiesComponent from './MediaSimilaritiesComponent'; // eslint-disable-line no-unused-vars
import SmallMediaCard from '../../cds/media-cards/SmallMediaCard'; // eslint-disable-line no-unused-vars

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
        check_search_trash { id, number_of_results }
        check_search_spam { id, number_of_results }
        public_team { id, trash_count, spam_count }
        smooch_bot: team_bot_installation(bot_identifier: "smooch") {
          id
        }
        permissions
        search_id
        medias_count
        id
      }
    }
  }
`;

const PaginatedMediaSuggestions = createPaginationContainer(
  props => (
    <MediaSuggestionsComponent
      demand={props.parentProps.project_media.demand}
      key={props.parentProps.project_media.confirmedSimilarCount}
      mainItem={props.parentProps.project_media}
      pageSize={props.pageSize}
      relationships={props.root.suggested_similar_relationships ? props.root.suggested_similar_relationships?.edges.map(r => r.node) : []}
      relay={props.relay}
      reportType={props.parentProps.project_media.report_type}
      superAdminMask={props.superAdminMask}
      team={props.parentProps.project_media.team}
      totalCount={props.root.suggested_similar_relationships?.totalCount}
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
                show_warning_cover
                media {
                  ...SmallMediaCard_media
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
