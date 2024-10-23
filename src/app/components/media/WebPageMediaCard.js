import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import deepEqual from 'deep-equal';
import cx from 'classnames/bind';
import Alert from '../cds/alerts-and-prompts/Alert';
import AspectRatio from '../layout/AspectRatio';
import styles from '../media/media.module.css';

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
      <article className={cx('web-page-media-card', styles['webpage-media-card'])}>
        <div
          className={cx(
            styles['webpage-media-card-title-summary'],
            {
              [styles['webpage-media-card-title-summary-modal']]: inModal,
            })
          }
        >
          { data.title ?
            <div className={cx('media-card-large__title', styles['webpage-media-card-title'])}>
              {data.title}
            </div> : null }
          { data.description && !inModal ?
            <p>
              {data.description}
            </p> : null }
        </div>
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
              <Alert
                className={cx('web-page-media-card__error', styles['webpage-media-card-error'])}
                contained
                content={
                  <FormattedMessage
                    defaultMessage="This item could not be identified. It may have been removed, or may only be visible to users who are logged in. Click the link above to navigate to it."
                    description="Error message displayed when link data is unavailable"
                    id="webPageMediaCard.Error"
                  />
                }
                variant="error"
              /> : null
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
