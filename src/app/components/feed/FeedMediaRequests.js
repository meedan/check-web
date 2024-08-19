/* eslint-disable relay/unused-fields */ // -> We're using the legacy `<Annotations />` component, which doesn't define a fragment.
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
    <div className={cx(styles['media-requests'], styles['media-item-content'])} id="media__requests">
      { projectMedia.requests_count > 0 && (
        <p className="typography-subtitle2">
          <FormattedMessage
            defaultMessage="{count, plural, one {# request} other {# requests}}"
            description="The count in a readable sentence of the number of requests for this media in the feed."
            id="feedMediaRequests.counter"
            values={{
              count: projectMedia.requests_count,
            }}
          />
        </p>
      )}
      <Annotations
        annotated={{ ...projectMedia, archived: 1 }}
        annotatedType="ProjectMedia"
        annotations={requests}
        annotationsCount={requests.length}
        component={TiplineRequest}
        componentProps={{ hideButtons: true }}
        noActivityMessage={
          <FormattedMessage
            defaultMessage="0 Requests"
            description="Empty message when there are zero requests for this item in the feed"
            id="feedMediaRequests.noRequest"
          />
        }
        noLink
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
