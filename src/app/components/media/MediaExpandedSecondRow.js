import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import MediaTypeDisplayName from './MediaTypeDisplayName';
import { isBotInstalled, parseStringUnixTimestamp } from '../../helpers';
import TimeBefore from '../TimeBefore';
import {
  units,
  Row,
} from '../../styles/js/shared';

const StyledHeaderTextSecondary = styled.div`
  justify-content: flex-start;
  flex-wrap: wrap;
  font-weight: 400;
  white-space: nowrap;
  margin-bottom: ${units(2)};
`;

const MediaExpandedSecondRow = ({ projectMedia }) => (
  <div>
    <StyledHeaderTextSecondary>
      <Row flexWrap style={{ fontWeight: '500' }}>
        <span><MediaTypeDisplayName mediaType={projectMedia.media.type} /></span>
        <span style={{ margin: `0 ${units(1)}` }}> - </span>
        <span>
          <FormattedMessage id="mediaExpanded.firstSeen" defaultMessage="First seen: " />
          <TimeBefore date={parseStringUnixTimestamp(projectMedia.created_at)} />
        </span>
        { isBotInstalled(projectMedia.team, 'smooch') ?
          <span>
            <span style={{ margin: `0 ${units(1)}` }}> - </span>
            <span>
              <FormattedMessage id="mediaExpanded.lastSeen" defaultMessage="Last seen: " />
              <TimeBefore date={parseStringUnixTimestamp(projectMedia.last_seen)} />
            </span>
            <span style={{ margin: `0 ${units(1)}` }}> - </span>
            <span>
              <FormattedMessage
                id="mediaExpanded.requests"
                defaultMessage="{count, plural, one {# request} other {# requests}}"
                values={{
                  count: projectMedia.requests_count,
                }}
              />
            </span>
          </span> : null }
      </Row>
    </StyledHeaderTextSecondary>
  </div>
);

MediaExpandedSecondRow.propTypes = {
  projectMedia: PropTypes.shape({
    team: PropTypes.shape({
      team_bot_installations: PropTypes.shape({
        edges: PropTypes.arrayOf(PropTypes.shape({
          node: PropTypes.shape({
            team_bot: PropTypes.shape({
              identifier: PropTypes.string.isRequired,
            }).isRequired,
          }).isRequired,
        })).isRequired,
      }),
    }).isRequired,
    media: PropTypes.shape({
      type: PropTypes.string.isRequired,
    }),
    created_at: PropTypes.string.isRequired,
    last_seen: PropTypes.string.isRequired,
    requests_count: PropTypes.number.isRequired,
  }).isRequired,
};

export default MediaExpandedSecondRow;
