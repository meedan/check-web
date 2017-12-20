import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Link } from 'react-router';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import styled from 'styled-components';
import MdFormatQuote from 'react-icons/lib/md/format-quote';
import FaFeed from 'react-icons/lib/fa/feed';
import IconInsertPhoto from 'material-ui/svg-icons/editor/insert-photo';
import rtlDetect from 'rtl-detect';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import TimeBefore from '../TimeBefore';
import MediaStatus from './MediaStatus';
import QuoteMediaCard from './QuoteMediaCard';
import MediaMetadata from './MediaMetadata';
import MediaUtil from './MediaUtil';
import PenderCard from '../PenderCard';
import ImageMediaCard from './ImageMediaCard';
import WebPageMediaCard from './WebPageMediaCard';
import CheckContext from '../../CheckContext';
import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import {
  Row,
  FadeIn,
  units,
  black87,
  black54,
  black38,
  defaultBorderRadius,
  Offset,
  caption,
  subheading1,
  gutterXSmall,
  Text,
} from '../../styles/js/shared';

const StyledHeading = styled.h3`
  font: ${subheading1};
  font-weight: 500;
  &,
  a,
  a:visited {
    color: ${black87} !important;
  }
`;

const StyledHeadingContainer = styled.span`
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

const StyledHeaderTextSecondary = styled.div`
  justify-content: flex-start;
  flex-wrap: wrap;
  font-weight: 400;
  white-space: nowrap;
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
    // Disable border in some views
    ${props => (props.hideBorder ? 'border: none;' : null)}
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
    return new CheckContext(this).getContextStore();
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
      ? [
        baseClass,
        `${baseClass}--${status.toLowerCase().replace(/[ _]/g, '-')}`,
      ].join(' ')
      : baseClass;
  }

  render() {
    const { media, annotated, annotatedType } = this.props;
    const data = JSON.parse(media.embed);
    const locale = this.props.intl.locale;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';
    const annotationsCount = MediaUtil.notesCount(media, data, this.props.intl);
    const randomNumber = Math.floor(Math.random() * 1000000);
    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));
    const cardHeaderStatus = (
      <MediaStatus media={media} readonly={this.props.readonly} />
    );
    const authorName = MediaUtil.authorName(media, data);
    const authorUsername = MediaUtil.authorUsername(media, data);
    const sourceName = MediaUtil.sourceName(media, data);
    const createdAt = MediaUtil.createdAt(media);
    const isImage = !!media.media.embed_path;
    const isQuote = media.media.quote && media.media.quote.length;
    const isWebPage = media.media.url && data.provider === 'page';
    const isPender = media.media.url && data.provider !== 'page';

    let projectId = media.project_id;

    if (!projectId && annotated && annotatedType === 'Project') {
      projectId = annotated.dbid;
    }

    const mediaUrl = projectId && media.team
      ? `/${media.team.slug}/project/${projectId}/media/${media.dbid}`
      : null;

    const title = isWebPage
      ? data.title || authorName || authorUsername
      : MediaUtil.title(media, data, this.props.intl);

    const heading = (
      <StyledHeading className="media__heading">
        <Link to={mediaUrl}>
          {title}
        </Link>
      </StyledHeading>
    );

    const sourceUrl = media.team && media.project && media.project_source
      ? `/${media.team.slug}/project/${media.project.dbid}/source/${media
        .project_source.dbid}`
      : null;

    const projectTitle = media.project ? media.project.title : null;

    const projectUrl = projectId && media.team
      ? `/${media.team.slug}/project/${projectId}`
      : null;

    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;

    const projectPage = /^\/.*\/project\//.test(path);

    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;
    media.quoteAttributions = media.media.quoteAttributions;

    const embedCard = (() => {
      if (isImage) {
        return <ImageMediaCard imagePath={media.embed_path} />;
      } else if (isQuote) {
        return (
          <QuoteMediaCard
            quote={media.quote}
            languageCode={media.language_code}
            sourceUrl={sourceUrl}
            sourceName={sourceName}
          />
        );
      } else if (isWebPage) {
        return (
          <WebPageMediaCard
            media={media}
            mediaUrl={mediaUrl}
            data={data}
            heading={heading}
            isRtl={isRtl}
            authorName={authorName}
            authorUserName={authorUsername}
          />
        );
      } else if (isPender) {
        return (
          <PenderCard
            url={media.url}
            penderUrl={config.penderUrl}
            fallback={null}
            domId={`pender-card-${randomNumber}`}
            mediaVersion={this.state.mediaVersion || data.refreshes_count}
          />
        );
      }

      return null;
    })();

    const mediaIcon = (() => {
      if (media.media.embed_path && media.media.embed_path !== '') {
        return <IconInsertPhoto />;
      } else if (media.quote) {
        return <MdFormatQuote />;
      }
      return MediaUtil.socialIcon(media.domain);
    })();

    // Don't display redundant heading if the card is explicitly expanded with state
    // (or implicitly expanded with initiallyExpanded prop)
    // Always display it if it's been edited
    const shouldDisplayHeading = isImage || MediaUtil.hasCustomTitle(media, data) ||
      !this.state.expanded && !(this.state.expanded == null && this.props.initiallyExpanded);

    const cardClassName =
      `${this.statusToClass('media-detail', mediaLastStatus(media))} ` +
      `media-detail--${MediaUtil.mediaTypeCss(media, data)}`;

    const shouldShowProjectName = !projectPage && projectTitle;

    const shouldShowDescription = MediaUtil.hasCustomDescription(media, data);

    const cardHeaderText = (
      <div>
        {shouldDisplayHeading ?
          <StyledHeadingContainer>{heading}</StyledHeadingContainer> : null
        }
        <StyledHeaderTextSecondary>
          <Row wrap>
            { createdAt
              ? <Row wrap>
                <Row>
                  <StyledMediaIconContainer>
                    {mediaIcon}
                  </StyledMediaIconContainer>
                  <Offset isRtl={isRtl}>
                    <Link className="media-detail__check-timestamp" to={mediaUrl}>
                      <TimeBefore date={createdAt} />
                    </Link>
                  </Offset>
                </Row>

                { shouldShowProjectName &&
                  <Offset isRtl={isRtl} >
                    <Link to={projectUrl} >
                      <Row>
                        <Text noShrink>in&nbsp;</Text>
                        <Text ellipsis maxWidth="300px">{projectTitle}</Text>
                      </Row>
                    </Link>
                  </Offset>
                }

                <Offset isRtl={isRtl}>
                  <Link to={mediaUrl}>
                    <span className="media-detail__check-notes-count">
                      {annotationsCount}
                    </span>
                  </Link>
                </Offset>
              </Row>
              : null }


            {sourceUrl && sourceName
              ? <Offset isRtl={isRtl}>
                <Link to={sourceUrl}>
                  <Row>
                    {/* ideally this would be SourcePicture not FaFeed — CGB 2017-9-13 */}
                    <FaFeed style={{ width: 16 }} />
                    {' '}
                    <Text ellipsis maxWidth="300px">{sourceName}</Text>
                  </Row>
                </Link>
                </Offset>
              : null}
          </Row>
        </StyledHeaderTextSecondary>
      </div>
    );

    return (
      <StyledMediaDetail
        className={cardClassName}
        borderColor={
          this.props.borderColor || getStatusStyle(status, 'backgroundColor')
        }
        fromDirection={fromDirection}
        hideBorder={this.props.hideBorder}
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
            <FadeIn
              className={this.statusToClass(
                'media-detail__media',
                mediaLastStatus(media),
              )}
            >
              { shouldShowDescription &&
                <Text font={caption} style={{ color: black54 }}>
                  {JSON.parse(this.props.media.embed).description}
                </Text>
              }
              {embedCard}
            </FadeIn>
          </CardText>
          <CardActions expandable>
            <MediaMetadata data={data} heading={title} {...this.props} />
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
  hideBorder: false,
};

export default injectIntl(MediaDetail);
