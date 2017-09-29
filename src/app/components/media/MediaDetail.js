import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Link } from 'react-router';
import config from 'config';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import styled from 'styled-components';
import MdFormatQuote from 'react-icons/lib/md/format-quote';
import FaFeed from 'react-icons/lib/fa/feed';
import IconInsertPhoto from 'material-ui/svg-icons/editor/insert-photo';
import rtlDetect from 'rtl-detect';
import TimeBefore from '../TimeBefore';
import MediaStatus from './MediaStatus';
import QuoteMediaCard from './QuoteMediaCard';
import MediaMetadata from './MediaMetadata';
import MediaUtil from './MediaUtil';
import PenderCard from '../PenderCard';
import ImageMediaCard from './ImageMediaCard';
import CheckContext from '../../CheckContext';

import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import {
  FlexRow,
  FadeIn,
  units,
  black87,
  black38,
  defaultBorderRadius,
} from '../../styles/js/shared';

const StyledCardHeaderTextPrimary = styled(Link)`
    padding-right: ${units(1)};
    display: inline-flex;
    align-items: center;
    font-size: '16px';
    margin-bottom: ${units(0.5)};
`;

const StyledMediaIconContainer = styled.div`
  display: inline-flex;
  align-items: flex-start;
  height: ${units(2)};
  padding-right: ${units(1)};
  svg {
    width: ${units(2)} !important;
    height: ${units(2)} !important;
    color: ${black38} !important;
  }
`;

const StyledHeaderTextSecondary = styled(FlexRow)`
  justify-content: flex-start;
  flex-wrap: wrap;
  font-size: 14;
  font-weight: 400;
`;

const StyledCardHeader = styled(CardHeader)`
  > div {
    padding: 0!important;
  }
`;

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
      expanded: null,
    };
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  handleExpandChange = (expanded) => {
    this.setState({ expanded });
  };

  handleToggle = (event, toggle) => {
    this.setState({ expanded: toggle });
  };

  handleExpand = () => {
    this.setState({ expanded: true });
  };

  handleReduce = () => {
    this.setState({ expanded: false });
  };

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
    // TODO get any quoteAttributions for quotes.
    // media.quoteAttributions = media.media.quoteAttributions;

    const createdAt = MediaUtil.createdAt(media);

    const heading = MediaUtil.title(media, data, this.props.intl);

    if (media.media.embed_path) {
      const path = media.media.embed_path;
      embedCard = <ImageMediaCard imagePath={path} />;
    } else if (media.quote && media.quote.length) {
      embedCard = (
        <QuoteMediaCard
          quote={media.quote}
          languageCode={media.language_code}
          // quoteAttributions={media.quoteAttributions}
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

    const mediaIcon = (() => {
      if (media.media.embed_path && media.media.embed_path !== '') {
        return (<IconInsertPhoto />);
      } else if (media.quote) {
        return (<MdFormatQuote />);
      }
      return (MediaUtil.socialIcon(media.domain));
    })();

    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

    const cardHeaderStatus = <MediaStatus media={media} readonly={this.props.readonly} />;

    const sourceUrl = media.team && media.project && media.project_source
      ? `/${media.team.slug}/project/${media.project.dbid}/source/${media.project_source.dbid}`
      : null;

    const authorName = MediaUtil.authorName(media, data);

    const authorUsername = MediaUtil.authorUsername(media, data);

    const sourceName = MediaUtil.sourceName(media, data);

    // const authorUrl = MediaUtil.authorUrl(media, data);

    // Don't display redunant heading if the card is explicitly expanded with state
    // (or implicitly expanded with initiallyExpanded prop)
    const shouldNotDisplayHeading =
      this.state.expanded || (this.state.expanded == null && this.props.initiallyExpanded);

    const cardHeaderText = (
      <div>
        {shouldNotDisplayHeading
          ? null
          : <StyledCardHeaderTextPrimary to={mediaUrl} className="media__heading">
            {heading}
          </StyledCardHeaderTextPrimary>}
        <StyledHeaderTextSecondary shouldNotDisplayHeading>
          <StyledMediaIconContainer>
            {mediaIcon}
          </StyledMediaIconContainer>
          {createdAt
            ? <span className="media-detail__check-added-at">
              <Link className="media-detail__check-timestamp" to={mediaUrl}>
                <TimeBefore style={{ marginRight: units(1) }} date={createdAt} />
              </Link>
              <Link to={mediaUrl}>
                <span style={{ marginRight: units(1) }} className="media-detail__check-notes-count">
                  {annotationsCount}
                </span>
              </Link>
            </span>
            : null}
          {sourceUrl
              ? <Link to={sourceUrl}>
                <FlexRow>
                  {/* ideally this would be SourcePicture not FaFeed — CGB 2017-9-13 */}
                  <FaFeed style={{ width: 16 }} />
                  {' '}
                  {authorName || authorUsername || sourceName}
                </FlexRow>
              </Link>
              : null}
        </StyledHeaderTextSecondary>
      </div>
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
        borderColor={this.props.borderColor || getStatusStyle(status, 'backgroundColor')}
        fromDirection={fromDirection}
      >
        <Card
          className="card-with-border"
          initiallyExpanded={this.props.initiallyExpanded}
          expanded={this.state.expanded}
          onExpandChange={this.handleExpandChange}
        >
          <StyledCardHeader
            title={cardHeaderStatus}
            subtitle={cardHeaderText}
            showExpandableButton
            style={{ paddingRight: units(5) }}
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
