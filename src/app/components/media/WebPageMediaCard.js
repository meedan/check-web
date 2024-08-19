import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import deepEqual from 'deep-equal';
import { Box } from '@material-ui/core';
import MediaCardTitleSummary from './MediaCardTitleSummary';
import AspectRatio from '../layout/AspectRatio';

class WebPageMediaCard extends Component {
  shouldComponentUpdate(nextProps) {
    return !deepEqual(nextProps, this.props);
  }

  canEmbedHtml() {
    const { projectMedia: { team }, projectMedia: { media: { metadata } } } = this.props;
    const embed = metadata;
    if (!embed.html) return false;
    if (!team?.get_embed_whitelist) return false;
    return team.get_embed_whitelist.split(',').some((domain) => {
      const url = new URL(embed.url);
      return url.hostname.indexOf(domain.trim()) > -1;
    });
  }

  render() {
    const {
      contentWarning,
      currentUserRole,
      data,
      inModal,
      projectMedia,
      superAdminMask,
      warningCategory,
      warningCreator,
    } = this.props;

    return (
      <article className="web-page-media-card">
        <MediaCardTitleSummary
          style={inModal ? { padding: '0 0 16px 0' } : null}
          summary={inModal ? null : data.description}
          title={data.title}
        />
        {this.canEmbedHtml() ?
          <div
            dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
              __html: data.html,
            }}
          />
          :
          <>
            { projectMedia.picture ?
              <AspectRatio
                contentWarning={contentWarning}
                currentUserRole={currentUserRole}
                key={contentWarning}
                projectMedia={projectMedia}
                superAdminMask={superAdminMask}
                warningCategory={warningCategory}
                warningCreator={warningCreator}
              >
                <img alt="" src={projectMedia.picture} onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }} />
              </AspectRatio> : null
            }
            { data.error ?
              <div className="web-page-media-card__error">
                <Box mt={2}>
                  <FormattedMessage
                    defaultMessage="This item could not be identified. It may have been removed, or may only be visible to users who are logged in. Click the link above to navigate to it."
                    description="Error message displayed when link data is unavailable"
                    id="webPageMediaCard.Error"
                  />
                </Box>
              </div> : null
            }
          </>
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
