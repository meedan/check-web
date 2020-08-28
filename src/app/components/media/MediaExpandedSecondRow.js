import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import MediaTypeDisplayName from './MediaTypeDisplayName';
import { parseStringUnixTimestamp } from '../../helpers';
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

const MediaExpandedSecondRow = ({ media }) => {
  let smoochBotInstalled = false;

  if (media.team && media.team.team_bot_installations) {
    media.team.team_bot_installations.edges.forEach((edge) => {
      if (edge.node.team_bot.identifier === 'smooch') {
        smoochBotInstalled = true;
      }
    });
  }

  return (
    <div>
      <StyledHeaderTextSecondary>
        <Row flexWrap style={{ fontWeight: '500' }}>
          <span><MediaTypeDisplayName mediaType={media.media.type} /></span>
          <span style={{ margin: `0 ${units(1)}` }}> - </span>
          <span>
            <FormattedMessage id="mediaExpanded.firstSeen" defaultMessage="First seen: " />
            <TimeBefore date={parseStringUnixTimestamp(media.created_at)} />
          </span>
          { smoochBotInstalled ?
            <span>
              <span style={{ margin: `0 ${units(1)}` }}> - </span>
              <span>
                <FormattedMessage id="mediaExpanded.lastSeen" defaultMessage="Last seen: " />
                <TimeBefore date={parseStringUnixTimestamp(media.last_seen)} />
              </span>
              <span style={{ margin: `0 ${units(1)}` }}> - </span>
              <span>
                <FormattedMessage
                  id="mediaExpanded.requests"
                  defaultMessage="{count} requests"
                  values={{
                    count: media.requests_count,
                  }}
                />
              </span>
            </span> : null
          }
        </Row>
      </StyledHeaderTextSecondary>
    </div>
  );
};

export default MediaExpandedSecondRow;
