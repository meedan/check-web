/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import ReportDesignerComponent from './ReportDesignerComponent';
import ErrorBoundary from '../../error/ErrorBoundary';
import Loader from '../../cds/loading/Loader';

const ReportDesigner = ({ params }) => {
  const ids = `${params.mediaId},${params.projectId}`;

  return (
    <ErrorBoundary component="ReportDesigner">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query ReportDesignerQuery($ids: String!) {
            project_media(ids: $ids) {
              id
              dbid
              oembed_metadata
              title
              demand
              description
              project_id
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
              show_warning_cover
              team {
                name
                avatar
                get_report
                get_report_design_image_template
              }
              ...ReportDesignerComponent_media
            }
          }
        `}
        render={({ error, props }) => {
          if (!error && props) {
            return <ReportDesignerComponent media={props.project_media} routeParams={params} />;
          }
          return <Loader size="medium" theme="grey" variant="inline" />;
        }}
        variables={{ ids }}
      />
    </ErrorBoundary>
  );
};

ReportDesigner.propTypes = {
  params: PropTypes.shape({
    mediaId: PropTypes.string.isRequired,
    projectId: PropTypes.string,
  }).isRequired,
};

export default ReportDesigner;
