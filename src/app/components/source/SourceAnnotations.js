import React from 'react';
import Relay from 'react-relay/classic';
import SourceRoute from '../../relay/SourceRoute';
import Annotations from '../annotations/Annotations';
import userFragment from '../../relay/userFragment';
import RelayContainer from '../../relay/RelayContainer';

const SourceAnnotationsComponent = (props) => {
  const { source } = props;
  if (source && source.source && source.source.log) {
    return (<Annotations
      annotations={source.source.log.edges}
      annotated={source}
      annotatedType="ProjectSource"
      height="short"
    />);
  }
  return null;
};

const SourceAnnotationsContainer = Relay.createContainer(SourceAnnotationsComponent, {
  fragments: {
    source: () => Relay.QL`
      fragment on ProjectSource {
        id
        dbid
        source {
          id
          dbid
          log(first: 10000) {
            edges {
              node {
                id,
                dbid,
                item_type,
                item_id,
                event,
                event_type,
                created_at,
                object_after,
                object_changes_json,
                meta,
                projects(first: 2) {
                  edges {
                    node {
                      id,
                      dbid,
                      title
                    }
                  }
                }
                user {
                  ${userFragment}
                }
                task {
                  id,
                  dbid,
                  label,
                  type
                }
                tag {
                  id,
                  tag,
                  tag_text
                }
                annotation {
                  id,
                  dbid,
                  content,
                  annotation_type,
                  updated_at,
                  created_at,
                  permissions,
                  medias(first: 10000) {
                    edges {
                      node {
                        id,
                        dbid,
                        quote,
                        published,
                        url,
                        metadata,
                        project_id,
                        last_status,
                        field_value(annotation_type_field_name: "translation_status:translation_status_status"),
                        log_count,
                        permissions,
                        verification_statuses,
                        translation_statuses,
                        domain,
                        team {
                          slug
                        }
                        media {
                          embed_path,
                          thumbnail_path,
                          url,
                          quote
                        }
                        user {
                          name,
                          source {
                            dbid
                          }
                        }
                      }
                    }
                  }
                  annotator {
                    name,
                    profile_image
                  }
                  version {
                    id
                    item_id
                    item_type
                  }
                }
              }
            }
          },
        }
      }
    `,
  },
});

const SourceAnnotations = (props) => {
  const ids = `${props.source.source_id},${props.source.project_id}`;
  const route = new SourceRoute({ ids });

  return (<RelayContainer Component={SourceAnnotationsContainer} route={route} loaderType="item" forceFetch />);
};

export default SourceAnnotations;
