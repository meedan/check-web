import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import CheckContext from '../../CheckContext';
import SourceRoute from '../../relay/SourceRoute';
import SourceComponent from './SourceComponent';

const SourceContainer = Relay.createContainer(SourceComponent, {
  fragments: {
    source: () => Relay.QL`
      fragment on ProjectSource {
        id,
        dbid,
        created_at,
        updated_at,
        source_id,
        project_id,
        project {
          get_languages
        },
        permissions,
        team {
          name,
          slug,
          get_suggested_tags,
        },
        source {
          id,
          dbid,
          created_at,
          updated_at,
          name,
          image,
          user_id,
          description,
          lock_version,
          overridden,
          permissions,
          pusher_channel,
          verification_statuses,
          metadata: annotations(annotation_type: "metadata", first: 1) {
            edges {
              node {
                id,
                dbid,
                annotation_type,
                annotated_type,
                annotated_id,
                annotator,
                content,
                created_at,
                updated_at,
                lock_version
              }
            }
          },
          languages: annotations(annotation_type: "language", first: 10000) {
            edges {
              node {
                id,
                dbid,
                annotation_type,
                annotated_type,
                annotated_id,
                annotator,
                content,
                created_at,
                updated_at
              }
            }
          },
          account_sources(first: 10000) {
            edges {
              node {
                id,
                account {
                  id,
                  created_at,
                  updated_at,
                  metadata,
                  image,
                  url,
                  provider,
                }
              }
            }
          },
          accounts(first: 10000) {
            edges {
              node {
                id,
                dbid,
                metadata,
                url,
                provider,
              }
            }
          },
          tags(first: 10000) {
            edges {
              node {
                tag,
                tag_text,
                id
              }
            }
          },
          medias_count,
          accounts_count,
        }
      }
    `,
  },
});

const Source = (props, context_) => {
  let projectId = props.params.projectId || 0;
  const context = new CheckContext({ props, context: context_ });
  context.setContext();
  if (!projectId) {
    const store = context.getContextStore();
    if (store.project) {
      projectId = store.project.dbid;
    }
  }

  const ids = `${props.params.sourceId},${projectId}`;
  const route = new SourceRoute({ ids });

  return (
    <Relay.RootContainer
      Component={SourceContainer}
      route={route}
      forceFetch
      renderFetched={data => <SourceContainer {...props} {...data} />}
    />
  );
};

Source.contextTypes = {
  store: PropTypes.object,
};

export default Source;
