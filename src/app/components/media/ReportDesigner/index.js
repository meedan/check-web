import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import RelayContainer from '../../../relay/RelayContainer';
import MediaRoute from '../../../relay/MediaRoute';
import ReportDesignerComponent from './ReportDesignerComponent';

const ReportDesignerContainer = Relay.createContainer(ReportDesignerComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        permissions
        oembed_metadata
        title
        demand
        description
        last_status
        project_ids # FIXME: Make MediaVerificationStatus a container
        media {
          picture
        }
        first_smooch_request: annotations(first: 1, annotation_type: "smooch") {
          edges {
            node {
              ... on Dynamic {
                created_at
              }
            }
          }
        }
        last_status_obj {
          id
          dbid
          locked
          content
        }
        dynamic_annotation_report_design {
          id
          dbid
          data
          sent_count
        }
        team {
          name
          slug
          avatar
          get_language
          get_languages
          get_report
          get_report_design_image_template
          verification_statuses
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

const ReportDesigner = (props) => {
  const ids = `${props.params.mediaId},${props.params.projectId}`;
  const route = new MediaRoute({ ids });

  return (
    <RelayContainer
      Component={ReportDesignerContainer}
      route={route}
      renderFetched={data => <ReportDesignerContainer {...props} {...data} />}
      forceFetch
    />
  );
};

ReportDesigner.propTypes = {
  params: PropTypes.shape({
    mediaId: PropTypes.string.isRequired,
    projectId: PropTypes.string,
  }).isRequired,
};

export default ReportDesigner;
