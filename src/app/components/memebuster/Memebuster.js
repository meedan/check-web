import React from 'react';
import Relay from 'react-relay/classic';
import MemebusterComponent from './MemebusterComponent';
import MediaRoute from '../../relay/MediaRoute';
import RelayContainer from '../../relay/RelayContainer';

const MemebusterContainer = Relay.createContainer(MemebusterComponent, {
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id,
        dbid,
        quote,
        published,
        archived,
        url,
        embed,
        last_status,
        permissions,
        project_id,
        verification_statuses,
        translation_statuses,
        overridden,
        language,
        language_code,
        annotations(first: 1, annotation_type: "memebuster") {
          edges {
            node {
              id
              annotated_id
              annotated_type
              annotation_type
              content
              annotator {
                name
              }
              created_at
              updated_at
              permissions
            }
          }
        }
        media {
          url,
          quote,
          picture,
          embed,
          embed_path,
          thumbnail_path
        }
        team {
          name
          avatar
          contacts(first: 1) {
            edges {
              node {
                web
              }
            }
          }
        }
      }
    `,
  },
});

const Memebuster = (props) => {
  const ids = `${props.params.mediaId},${props.params.projectId}`;
  const route = new MediaRoute({ ids });

  return (
    <RelayContainer
      Component={MemebusterContainer}
      route={route}
      renderFetched={data => <MemebusterContainer {...props} {...data} />}
    />
  );
};

export default Memebuster;
