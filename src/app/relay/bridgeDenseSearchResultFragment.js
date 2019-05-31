import Relay from 'react-relay/classic';

const bridgeDenseSearchResultFragment = Relay.QL`
  fragment on CheckSearch {
    id,
    pusher_channel,
    medias(first: $pageSize) {
      edges {
        node {
          id,
          dbid,
          domain,
          metadata,
          quote,
          overridden,
          relationships { sources_count, targets_count },
          relationship { id, dbid, source_id, target_id },
          verification_statuses,
          translation_statuses,
          project_id,
          permissions,
          last_status,
          last_status_obj {
            id,
            dbid,
            content,
            locked
          }
          media {
            url,
            metadata,
            quote,
            picture
            thumbnail_path
            picture
          }
          team {
            slug
            search_id,
            get_status_target_turnaround
          }
        }
      }
    },
    number_of_results
  }
`;

module.exports = bridgeDenseSearchResultFragment;
