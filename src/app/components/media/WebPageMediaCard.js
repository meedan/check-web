import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import deepEqual from 'deep-equal';
import { Box } from '@material-ui/core';
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
      inModal,
      currentUserRole,
      superAdminMask,
    } = this.props;

    return (
      <article className="web-page-media-card">
        <MediaCardTitleSummary
          title={data.title}
          summary={inModal ? null : data.description}
          style={inModal ? { padding: '0 0 16px 0' } : null}
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
                currentUserRole={currentUserRole}
                superAdminMask={superAdminMask}
              >
                <img src={projectMedia.picture} alt="" onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }} />
              </AspectRatio> : null
            }
            { !data.error ?
              <div className="web-page-media-card__error">
                <Box mt={2}>
                  <FormattedMessage
                    id="webPageMediaCard.Error"
                    defaultMessage="This item could not be identified. It may have been removed, or may only be visible to users who are logged in. Click the link above to navigate to it."
                    description="Error message displayed when link data is unavailable"
                  />
                </Box>
              </div> : null
            }
          </div>
        }
      </article>
    );
  }
}

export { WebPageMediaCard };
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
