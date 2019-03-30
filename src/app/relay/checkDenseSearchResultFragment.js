import Relay from 'react-relay/classic';

const checkDenseSearchResultFragment = Relay.QL`
  fragment on CheckSearch {
    id,
    pusher_channel,
    medias(first: $pageSize) {
      edges {
        node {
          id,
          dbid,
          domain,
          embed,
          quote,
          overridden,
          relationships { sources_count, targets_count },
          verification_statuses,
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
            embed,
            quote,
            picture
            thumbnail_path
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

module.exports = checkDenseSearchResultFragment;
