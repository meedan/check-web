import React from 'react';
import { Link } from 'react-router';
import Card from '@material-ui/core/Card';
import LayersIcon from '@material-ui/icons/Layers';
import TimerIcon from '@material-ui/icons/Timer';
import styled from 'styled-components';
import { CardWithBorder } from './MediaDetail';
import MediaSelectable from './MediaSelectable';
import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import { units, Row, black38 } from '../../styles/js/shared';

const RelationIcon = styled.div`
  svg {
    min-width: 20px !important;
    min-height: 20px !important;
    color: ${black38};
  }
`;

const Content = styled.div`
  width: 100%;
  height: ${units(10)};
  display: flex;
  flex-direction: column;
  align-content: flex-end;
`;

const UpperRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const BottomRow = styled.div`
  width: 100%;
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  font-size: smaller;
`;

const SmallMediaCard = (props) => {
  const { media } = props;
  const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

  let hasRelationships = false;

  if (props.media.relationships) {
    const { sources_count, targets_count } = props.media.relationships;
    hasRelationships = Boolean(sources_count || targets_count);
  }

  const mediaUrl = media.team && media.dbid > 0
    ? `/${media.team.slug}/project/${media.project_id}/media/${media.dbid}`
    : null;

  return (
    <MediaSelectable media={media} onSelect={props.onSelect}>
      <CardWithBorder
        fromDirection="left"
        borderColor={getStatusStyle(status, 'backgroundColor')}
      >
        <Card
          className="card-with-border"
          style={{ height: units(12), width: units(35) }}
        >
          <div
            className={props.selected ? 'media-detail__card-header-selected' : 'media-detail__card-header'}
            style={{ padding: units(1), height: units(12) }}
          >
            <Row>
              { props.media.embed.picture ?
                <div style={{ marginRight: units(1) }}>
                  <Link to={mediaUrl}>
                    <img src={props.media.embed.picture} alt="item thumbnail" width={units(10)} height={units(10)} />
                  </Link>
                </div>
                : null
              }
              <Content>
                <UpperRow>
                  <div style={{ overflow: 'hidden', maxHeight: units(5) }}>
                    <Link to={mediaUrl}>
                      {props.media.embed.title}
                    </Link>
                  </div>
                  { hasRelationships ?
                    <RelationIcon>
                      <LayersIcon />
                    </RelationIcon> : null
                  }
                </UpperRow>
                <BottomRow>
                  <Row><TimerIcon style={{ maxHeight: units(1.5) }} /><span>1 hour left</span></Row>
                </BottomRow>
              </Content>
            </Row>
          </div>
        </Card>
      </CardWithBorder>
    </MediaSelectable>
  );
};


export default SmallMediaCard;
