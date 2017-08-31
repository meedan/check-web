import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Link } from 'react-router';
import config from 'config';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import MediaStatus from './MediaStatus';
import QuoteMediaCard from './QuoteMediaCard';
import MediaMetadata from './MediaMetadata';
import MediaUtil from './MediaUtil';
import PenderCard from '../PenderCard';
import ImageMediaCard from './ImageMediaCard';
import CheckContext from '../../CheckContext';
import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import { units, black87, FadeIn, FlexRow, defaultBorderRadius } from '../../styles/js/variables';

const StyledMediaDetail = styled.div`

  .card-with-border {
    border-${props => props.fromDirection}: ${units(1)} solid;
    border-color: ${props => props.borderColor};
    border-radius: ${defaultBorderRadius};
  }

  .media__heading {
    &,
    & > a,
    & > a:visited {
      color: ${black87} !important;
    }
  }

  .media-detail__description {
    margin-top: ${units(1)};
    max-width: ${units(80)};
  }
`;

class MediaDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mediaVersion: false,
    };
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  statusToClass(baseClass, status) {
    // TODO: replace with helpers.js#bemClassFromMediaStatus
    return status.length
      ? [baseClass, `${baseClass}--${status.toLowerCase().replace(/[ _]/g, '-')}`].join(' ')
      : baseClass;
  }

  render() {
    const { media, annotated, annotatedType } = this.props;
    const data = JSON.parse(media.embed);
    const annotationsCount = MediaUtil.notesCount(media, data, this.props.intl);
    const randomNumber = Math.floor(Math.random() * 1000000);

    let projectId = media.project_id;
    if (!projectId && annotated && annotatedType === 'Project') {
      projectId = annotated.dbid;
    }
    const mediaUrl = projectId && media.team
      ? `/${media.team.slug}/project/${projectId}/media/${media.dbid}`
      : null;

    let embedCard = null;
    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;

    const heading = MediaUtil.title(media, data, this.props.intl);

    if (media.media.embed_path) {
      const path = media.media.embed_path;
      embedCard = <ImageMediaCard imagePath={path} />;
    } else if (media.quote && media.quote.length) {
      embedCard = (
        <QuoteMediaCard
          quoteText={media.quote}
          languageCode={media.language_code}
          attributionName={null}
          attributionUrl={null}
        />
      );
    } else if (media.url) {
      embedCard = (
        <PenderCard
          url={media.url}
          penderUrl={config.penderUrl}
          fallback={null}
          domId={`pender-card-${randomNumber}`}
          mediaVersion={this.state.mediaVersion || data.refreshes_count}
        />
      );
    }

    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

    const cardHeaderTitle = <MediaStatus media={media} readonly={this.props.readonly} />;

    const cardHeaderSubtitle = (
      <FlexRow style={{ flexWrap: 'wrap' }}>
        <Link
          to={mediaUrl}
          className="media__heading"
          style={{ paddingRight: units(1) }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'flex-start', height: units(2), paddingRight: units(1) }}>
            {MediaUtil.socialIcon(media.domain)}
          </span>
          {heading}
        </Link>
        <span className="media-detail__check-notes-count">
          {annotationsCount}
        </span>
      </FlexRow>
    );

    const cardClassName =
      `${this.statusToClass('media-detail', mediaLastStatus(media))} ` +
      `media-detail--${MediaUtil.mediaTypeCss(media, data)}`;

    const locale = this.props.intl.locale;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';

    return (
      <StyledMediaDetail
        className={cardClassName}
        borderColor={getStatusStyle(status, 'backgroundColor')}
        fromDirection={fromDirection}
      >
        <Card
          className="card-with-border"
          initiallyExpanded={this.props.initiallyExpanded}
        >

          <CardHeader
            title={cardHeaderTitle}
            subtitle={cardHeaderSubtitle}
            showExpandableButton
          />

          <CardText expandable>
            <FadeIn className={this.statusToClass('media-detail__media', mediaLastStatus(media))}>
              {embedCard}
            </FadeIn>
          </CardText>
          <CardActions expandable>
            <MediaMetadata data={data} heading={heading} {...this.props} />
          </CardActions>
        </Card>
      </StyledMediaDetail>
    );
  }
}

MediaDetail.propTypes = {
  intl: intlShape.isRequired,
};

MediaDetail.contextTypes = {
  store: React.PropTypes.object,
};

MediaDetail.defaultProps = {
  initiallyExpanded: false,
};

export default injectIntl(MediaDetail);
