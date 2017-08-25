import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Link } from 'react-router';
import config from 'config';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import QuoteMediaCard from './QuoteMediaCard';
import MediaMetadata from './MediaMetadata';
import MediaUtil from './MediaUtil';
import PenderCard from '../PenderCard';
import ImageMediaCard from './ImageMediaCard';
import CheckContext from '../../CheckContext';
import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import { units } from '../../styles/js/variables';

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

    const cardHeaderTitle = <Link to={mediaUrl} className="media__heading">{heading}</Link>;

    const cardHeaderSubtitle = [
      MediaUtil.socialIcon(media.domain),
      <span
        className="media-detail__check-notes-count"
        style={{ paddingLeft: units(1), paddingRight: units(1) }}
        key="media-detail__annotations-count"
      >
        {annotationsCount}
      </span>,
    ];

    const cardClassName = `${this.statusToClass('media-detail', mediaLastStatus(media))} ` +
          `media-detail--${MediaUtil.mediaTypeCss(media, data)}`;

    return (
      <Card
        initiallyExpanded={this.props.initiallyExpanded}
        className={cardClassName}
        style={{ borderColor: getStatusStyle(status, 'borderColor') }}
      >
        <CardHeader
          title={cardHeaderTitle}
          subtitle={cardHeaderSubtitle}
          showExpandableButton
        />

        <CardText expandable>
          <div className={this.statusToClass('media-detail__media', mediaLastStatus(media))}>
            {embedCard}
          </div>
        </CardText>
        <CardActions expandable>
          <MediaMetadata data={data} heading={heading} {...this.props} />
        </CardActions>
      </Card>
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
