import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import CheckContext from '../../CheckContext';
import MediaRoute from '../../relay/MediaRoute';
import MediaComponent from './MediaComponent';
import MediasLoading from './MediasLoading';
import MediaAnalysis from './MediaAnalysis'; // eslint-disable-line no-unused-vars
import MediaTags from './MediaTags'; // eslint-disable-line no-unused-vars

const MediaContainer = Relay.createContainer(MediaComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        title
        ${MediaAnalysis.getFragment('projectMedia')}
        ${MediaTags.getFragment('projectMedia')}
        read_by_someone: is_read
        read_by_me: is_read(by_me: true)
        permissions
        pusher_channel
        project_id
        requests_count
        picture
        show_warning_cover
        creator_name
        user_id
        channel
        suggested_main_item # used by MediaClaim, MediaFactCheck
        is_confirmed_similar_to_another_item
        is_secondary
        claim_description {
          id
          dbid
          description
          updated_at
          user {
            name
          }
          fact_check {
            id
            title
            summary
            url
            updated_at
            user {
              name
            }
          }
        }
        media {
          url
          quote
          embed_path
          metadata
          type
          picture
        }
        last_status
        last_status_obj {
          id
          data
          updated_at
        }
        report: dynamic_annotation_report_design {
          id
          data
        }
        comments: annotations(first: 10000, annotation_type: "comment") {
          edges {
            node {
              ... on Comment {
                id
                dbid
                text
                parsed_fragment
                annotator {
                  id
                  name
                  profile_image
                }
                comments: annotations(first: 10000, annotation_type: "comment") {
                  edges {
                    node {
                      ... on Comment {
                        id
                        created_at
                        text
                        annotator {
                          id
                          name
                          profile_image
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        clips: annotations(first: 10000, annotation_type: "clip") {
          edges {
            node {
              ... on Dynamic {
                id
                data
                parsed_fragment
              }
            }
          }
        }
        tags(first: 10000) {
          edges {
            node {
              id
              dbid
              fragment
              parsed_fragment
              annotated_id
              annotated_type
              annotated_type
              tag_text_object {
                id
                text
              }
            }
          }
        }
        geolocations: annotations(first: 10000, annotation_type: "geolocation") {
          edges {
            node {
              ... on Dynamic {
                id
                parsed_fragment
                content
              }
            }
          }
        }
        team {
          id
          dbid
          slug
          name
          get_language
          get_report
          verification_statuses
          get_tasks_enabled
          team_bots(first: 10000) {
            edges {
              node {
                login
              }
            }
          }
          smooch_bot: team_bot_installation(bot_identifier: "smooch") {
            id
          }
        }
      }
    `,
  },
});

const ProjectMedia = (props, context) => {
  let { projectId } = props;
  const { projectMediaId, view } = props;
  const checkContext = new CheckContext({ props, context });
  checkContext.setContext();
  if (!projectId) {
    const store = checkContext.getContextStore();
    if (store.project) {
      projectId = store.project.dbid;
    }
  }
  const ids = `${projectMediaId},${projectId}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaContainer}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
      renderFetched={data => <MediaContainer {...data} view={view} />}
      forceFetch
    />
  );
};

ProjectMedia.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(ProjectMedia);
