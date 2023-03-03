import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import deepEqual from 'deep-equal';
import AspectRatio from '../layout/AspectRatio';
import MediaCardTitleSummary from './MediaCardTitleSummary';

class WebPageMediaCard extends Component {
  shouldComponentUpdate(nextProps) {
    return !deepEqual(nextProps, this.props);
  }

  canEmbedHtml() {
    const { projectMedia: { team }, projectMedia: { media: { metadata } } } = this.props;
    const embed = metadata;
    if (!embed.html) return false;
    if (!team.get_embed_whitelist) return false;
    return team.get_embed_whitelist.split(',').some((domain) => {
      const url = new URL(embed.url);
      return url.hostname.indexOf(domain.trim()) > -1;
    });
  }

  render() {
    const {
      projectMedia,
      data,
      contentWarning,
      warningCreator,
      warningCategory,
    } = this.props;

    return (
      <article className="web-page-media-card">
        <MediaCardTitleSummary
          title={data.title}
          summary={data.description}
        />
        {this.canEmbedHtml() ?
          <div
            dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
              __html: data.html,
            }}
          />
          :
          <div>
            { projectMedia.picture ?
              <AspectRatio
                key={contentWarning}
                contentWarning={contentWarning}
                warningCreator={warningCreator}
                warningCategory={warningCategory}
                projectMedia={projectMedia}
              >
                <img src={projectMedia.picture} alt="" onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }} />
              </AspectRatio> : null
            }
            <p />
            { data.error ?
              <div className="web-page-media-card__error">
                <FormattedMessage
                  id="webPageMediaCard.Error"
                  defaultMessage="This item could not be identified. It may have been removed, or may only be visible to users who are logged in. Click the link above to navigate to it."
                  description="Error message displayed when link data is unavailable"
                />
              </div> : null
            }
          </div>
        }
      </article>
    );
  }
}

export default createFragmentContainer(WebPageMediaCard, graphql`
  fragment WebPageMediaCard_projectMedia on ProjectMedia {
    ...AspectRatio_projectMedia
    picture
    team {
      get_embed_whitelist
    }
    media {
      metadata
    }
  }
`);
