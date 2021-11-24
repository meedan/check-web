import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import deepEqual from 'deep-equal';
import AspectRatio from '../layout/AspectRatio';

class WebPageMediaCard extends Component {
  shouldComponentUpdate(nextProps) {
    return !deepEqual(nextProps, this.props);
  }

  canEmbedHtml() {
    const { media: { team }, media: { media: { metadata } } } = this.props;
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
      media,
      data,
      contentWarning,
      warningCreator,
      warningCategory,
    } = this.props;

    return (
      <article className="web-page-media-card">
        {this.canEmbedHtml() ?
          <div
            dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
              __html: data.html,
            }}
          />
          :
          <div>
            { media.picture ?
              <AspectRatio
                key={contentWarning}
                contentWarning={contentWarning}
                warningCreator={warningCreator}
                warningCategory={warningCategory}
              >
                <img src={media.picture} alt="" onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }} />
              </AspectRatio> : null
            }
            <p />
            { data.error ?
              <div className="web-page-media-card__error">
                <FormattedMessage
                  id="webPageMediaCard.Error"
                  defaultMessage="This item could not be identified. It may have been removed, or may only be visible to users who are logged in. Click the link above to navigate to it."
                />
              </div> : null
            }
          </div>
        }
      </article>
    );
  }
}

export default WebPageMediaCard;
