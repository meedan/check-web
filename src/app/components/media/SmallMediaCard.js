import React from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router';
import Card from '@material-ui/core/Card';
import LayersIcon from '@material-ui/icons/Layers';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import { CardWithBorder } from './MediaDetail';
import MediaSelectable from './MediaSelectable';
import ItemDeadline from './ItemDeadline';
import MediaUtil from './MediaUtil';
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
  const { media, intl: { locale } } = props;
  const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

  let hasRelationships = false;

  if (media.relationships) {
    const { sources_count, targets_count } = media.relationships;
    hasRelationships = Boolean(sources_count || targets_count);
  }

  const isRtl = rtlDetect.isRtlLang(locale);

  const mediaUrl = media.team && media.dbid > 0
    ? `/${media.team.slug}/project/${media.project_id}/media/${media.dbid}`
    : null;

  const image = media.media.picture;
  const data = typeof media.embed === 'string' ? JSON.parse(media.embed) : media.embed;

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
              { image ?
                <div style={{ marginRight: units(1) }}>
                  <Link to={mediaUrl}>
                    <img src={image} alt="item thumbnail" width={units(10)} height={units(10)} />
                  </Link>
                </div>
                : null
              }
              <Content>
                <UpperRow>
                  <div style={{ overflow: 'hidden', maxHeight: units(5) }}>
                    <Link to={mediaUrl}>
                      {MediaUtil.title(media, data, props.intl)}
                    </Link>
                  </div>
                  { hasRelationships ?
                    <RelationIcon>
                      <LayersIcon />
                    </RelationIcon> : null
                  }
                </UpperRow>
                <BottomRow>
                  <ItemDeadline media={media} isRtl={isRtl} />
                </BottomRow>
              </Content>
            </Row>
          </div>
        </Card>
      </CardWithBorder>
    </MediaSelectable>
  );
};


export default injectIntl(SmallMediaCard);
