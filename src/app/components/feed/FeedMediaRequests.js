/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import Annotations from '../annotations/Annotations';
import TiplineRequest from '../annotations/TiplineRequest';
import styles from '../media/media.module.css';

const FeedMediaRequests = ({ projectMedia }) => {
  const requests = projectMedia.requests?.edges || [];

  return (
    <div id="media__requests" className={cx(styles['media-requests'], styles['media-item-content'])}>
      { projectMedia.requests_count > 0 && (
        <span className="typography-subtitle2">
          <FormattedMessage
            id="feedMediaRequests.counter"
            defaultMessage="{count, plural, one {# request} other {# requests}}"
            description="The count in a readable sentence of the number of requests for this media in the feed."
            values={{
              count: projectMedia.requests_count,
            }}
          />
        </span>
      )}
      <Annotations
        noLink
        component={TiplineRequest}
        componentProps={{ showButtons: false }}
        annotations={requests}
        annotated={{ ...projectMedia, archived: 1 }}
        annotatedType="ProjectMedia"
        annotationsCount={requests.length}
        noActivityMessage={
          <FormattedMessage
            id="feedMediaRequests.noRequest"
            defaultMessage="0 Requests"
            description="Empty message when there are zero requests for this item in the feed"
          />
        }
      />
    </div>
  );
};

FeedMediaRequests.propTypes = {
  projectMedia: PropTypes.object.isRequired,
};

export default createFragmentContainer(FeedMediaRequests, graphql`
  fragment FeedMediaRequests_projectMedia on ProjectMedia {
    id
    dbid
    requests_count
    media {
      file_path
    }
    requests(last: 100) {
      edges {
        node {
          id
          dbid
          associated_id
          associated_graphql_id
          created_at
          smooch_data
          smooch_user_request_language
          smooch_user_external_identifier
          smooch_report_sent_at
          smooch_report_received_at
          smooch_report_correction_sent_at
          smooch_report_update_received_at
          smooch_request_type
        }
      }
    }
  }
`);
