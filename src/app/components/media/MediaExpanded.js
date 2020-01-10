import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { CardTitle, CardText, CardActions } from 'material-ui/Card';
import { Link } from 'react-router';
import styled from 'styled-components';
import MediaRoute from '../../relay/MediaRoute';
import MediaMetadata from './MediaMetadata';
import MediaUtil from './MediaUtil';
import ParsedText from '../ParsedText';
import TimeBefore from '../TimeBefore';
import QuoteMediaCard from './QuoteMediaCard';
import WebPageMediaCard from './WebPageMediaCard';
import ImageMediaCard from './ImageMediaCard';
import VideoMediaCard from './VideoMediaCard';
import PenderCard from '../PenderCard';
import CheckContext from '../../CheckContext';
import {
  FadeIn,
  caption,
  black54,
  units,
  Text,
  Row,
  checkBlue,
} from '../../styles/js/shared';

const StyledHeaderTextSecondary = styled.div`
  justify-content: flex-start;
  flex-wrap: wrap;
  font-weight: 400;
  white-space: nowrap;
  margin-bottom: ${units(5)};
`;

class MediaExpandedComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mediaVersion: false,
    };
  }

  componentDidMount() {
    this.setContext();
  }

  componentDidUpdate() {
    this.setContext();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  setContext() {
    const context = new CheckContext(this);
    const { team, project } = this.props.media;
    context.setContextStore({ team, project });
  }

  render() {
    const { media } = this.props;
    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;
    const data = typeof media.metadata === 'string' ? JSON.parse(media.metadata) : media.metadata;
    const isImage = media.media.type === 'UploadedImage';
    const isVideo = media.media.type === 'UploadedVideo';
    const isQuote = media.media.type === 'Claim';
    const isWebPage = media.media.url && data.provider === 'page';
    const authorName = MediaUtil.authorName(media, data);
    const authorUsername = MediaUtil.authorUsername(media, data);
    const isPender = media.media.url && data.provider !== 'page';
    const randomNumber = Math.floor(Math.random() * 1000000);
    const shouldShowDescription = MediaUtil.hasCustomDescription(media, data);
    const { isRtl, mediaUrl, mediaQuery } = this.props;
    const posterUrl = media.media.thumbnail_path;

    const embedCard = (() => {
      if (isImage) {
        return <ImageMediaCard imagePath={media.embed_path} />;
      } else if (isVideo) {
        return <VideoMediaCard videoPath={media.media.file_path} posterPath={posterUrl} />;
      } else if (isQuote) {
        return (
          <QuoteMediaCard
            quote={media.quote}
            languageCode={media.language_code}
          />
        );
      } else if (isWebPage) {
        return (
          <WebPageMediaCard
            media={media}
            mediaUrl={mediaUrl}
            mediaQuery={mediaQuery}
            data={data}
            isRtl={isRtl}
            authorName={authorName}
            authorUserName={authorUsername}
          />
        );
      } else if (isPender) {
        return (
          <PenderCard
            url={media.url}
            fallback={null}
            domId={`pender-card-${randomNumber}`}
            mediaVersion={this.state.mediaVersion || data.refreshes_count}
          />
        );
      }

      return null;
    })();

    let sourceName = MediaUtil.sourceName(media, data);
    if (sourceName === '') {
      sourceName = (<FormattedMessage id="mediaExpanded.unknown" defaultMessage="unknown" />);
    }
    const sourceUrl = media.team &&
      media.project &&
      media.project_source &&
      media.project_source.dbid ?
      `/${media.team.slug}/project/${media.project.dbid}/source/${media.project_source.dbid}` :
      null;

    const cardHeaderText = (
      <div>
        <StyledHeaderTextSecondary>
          <Row flexWrap style={{ fontWeight: 'bold' }}>
            <span>
              <FormattedMessage id="mediaExpanded.source" defaultMessage="Source" />
              {': '}
              { sourceUrl ?
                <Link to={sourceUrl} style={{ color: checkBlue }}>{sourceName}</Link> :
                <b style={{ color: checkBlue }}>{sourceName}</b> }
            </span>
            <span style={{ margin: '0 16px' }}> - </span>
            <span style={{ color: checkBlue }}>{media.media.type}</span>
            <span style={{ margin: '0 16px' }}> - </span>
            <span>
              <FormattedMessage id="mediaExpanded.firstSeen" defaultMessage="First seen: " />
              <TimeBefore date={MediaUtil.createdAt({ published: media.created_at })} />
            </span>
            <span style={{ margin: '0 16px' }}> - </span>
            <span>
              <FormattedMessage id="mediaExpanded.lastSeen" defaultMessage="Last seen: " />
              <TimeBefore date={MediaUtil.createdAt({ published: media.last_seen })} />
            </span>
            <span style={{ margin: '0 16px' }}> - </span>
            <span style={{ color: checkBlue }}>
              <FormattedMessage
                id="mediaExpanded.requests"
                defaultMessage="{count} requests"
                values={{
                  count: media.requests_count,
                }}
              />
            </span>
          </Row>
        </StyledHeaderTextSecondary>
      </div>
    );

    return (
      <span>
        <CardTitle title={media.title} />
        <CardText style={{ padding: '0 16px' }}>
          {cardHeaderText}
          <FadeIn>
            {shouldShowDescription ?
              <Text font={caption} style={{ color: black54 }}>
                <ParsedText text={data.description} />
              </Text> : null}
            {embedCard}
          </FadeIn>
        </CardText>
        <CardActions style={{ paddingRight: units(0.5) }}>
          <MediaMetadata data={data} {...this.props} media={media} />
        </CardActions>
      </span>
    );
  }
}

MediaExpandedComponent.contextTypes = {
  store: PropTypes.object,
};

const MediaExpandedContainer = Relay.createContainer(MediaExpandedComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        metadata
        permissions
        domain
        created_at
        last_seen
        requests_count
        title
        picture
        description
        language_code
        language
        project_id
        project_ids
        dynamic_annotation_language {
          id
        }
        project {
          id
          dbid
          title
        }
        relationships {
          id
          sources_count
          targets_count
          source_id
          target_id
        }
        relationship {
          id
          permissions
          source_id
          source {
            id
            dbid
            relationships {
              targets(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
          target_id
          target { id, dbid }
        }
        media {
          url
          type
          quote
          thumbnail_path
          file_path
          embed_path
          metadata 
        }
        project_source {
          id
          dbid
          source {
            id
            dbid
            name
          }
        }
        team {
          id
          dbid
          slug
          search_id
          verification_statuses
          translation_statuses
        }
        tags(first: 10000) {
          edges {
            node {
              id
              tag
              tag_text
            }
          }
        }
      }
    `,
  },
});

const MediaExpanded = (props) => {
  const ids = `${props.media.dbid},${props.media.project_id}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaExpandedContainer}
      renderFetched={data => <MediaExpandedContainer {...props} {...data} />}
      route={route}
    />
  );
};

export default MediaExpanded;
