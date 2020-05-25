import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import styled from 'styled-components';
import MediaRoute from '../../relay/MediaRoute';
import MediaMetadata from './MediaMetadata';
import MediaUtil from './MediaUtil';
import MoreLess from '../layout/MoreLess';
import ParsedText from '../ParsedText';
import TimeBefore from '../TimeBefore';
import QuoteMediaCard from './QuoteMediaCard';
import WebPageMediaCard from './WebPageMediaCard';
import ImageMediaCard from './ImageMediaCard';
import VideoMediaCard from './VideoMediaCard';
import PenderCard from '../PenderCard';
import { truncateLength } from '../../helpers';
import CheckContext from '../../CheckContext';
import {
  FadeIn,
  units,
  Row,
} from '../../styles/js/shared';

const StyledHeaderTextSecondary = styled.div`
  justify-content: flex-start;
  flex-wrap: wrap;
  font-weight: 400;
  white-space: nowrap;
  margin-bottom: ${units(3)};
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
    let smoochBotInstalled = false;
    if (media.team && media.team.team_bot_installations) {
      media.team.team_bot_installations.edges.forEach((edge) => {
        if (edge.node.team_bot.identifier === 'smooch') {
          smoochBotInstalled = true;
        }
      });
    }
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
    const { isRtl, mediaUrl, mediaQuery } = this.props;
    const posterUrl = media.media.thumbnail_path;
    const hasCustomDescription = MediaUtil.hasCustomDescription(media, data);

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
      } else if (isWebPage || data.error) {
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

    const cardHeaderText = (
      <div>
        <StyledHeaderTextSecondary>
          <Row flexWrap style={{ fontWeight: '500' }}>
            <span>
              {MediaUtil.mediaTypeLabel(media.media.type, this.props.intl)}
            </span>
            <span style={{ margin: `0 ${units(1)}` }}> - </span>
            <span>
              <FormattedMessage id="mediaExpanded.firstSeen" defaultMessage="First seen: " />
              <TimeBefore date={MediaUtil.createdAt({ published: media.created_at })} />
            </span>
            { smoochBotInstalled ?
              <span>
                <span style={{ margin: `0 ${units(1)}` }}> - </span>
                <span>
                  <FormattedMessage id="mediaExpanded.lastSeen" defaultMessage="Last seen: " />
                  <TimeBefore date={MediaUtil.createdAt({ published: media.last_seen })} />
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

    return (
      <span>
        <CardHeader
          style={{ lineHeight: units(4) }}
          title={truncateLength(media.title, 110)}
        />
        <CardContent style={{ padding: `0 ${units(2)}` }}>
          {cardHeaderText}
          <FadeIn>
            { hasCustomDescription ?
              <MoreLess key={media.description /* reset on new text */}>
                <ParsedText text={media.description} />
              </MoreLess> : null }
            {embedCard}
          </FadeIn>
        </CardContent>
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
        share_count
        requests_count
        title
        picture
        overridden
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
          search_id
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
          get_languages
          team_bot_installations(first: 10000) {
            edges {
              node {
                id
                team_bot: bot_user {
                  id
                  identifier
                }
              }
            }
          }
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

export default injectIntl(MediaExpanded);
