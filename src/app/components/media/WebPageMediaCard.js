import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import deepEqual from 'deep-equal';
import styled from 'styled-components';
import AspectRatio from '../layout/AspectRatio';
import ExternalLink from '../ExternalLink';
import { truncateLength } from '../../helpers';
import ParsedText from '../ParsedText';
import {
  units,
} from '../../styles/js/shared';

const StyledLink = styled.div`
  margin-top: ${units(2)};
  a {
    text-decoration: underline;
  }
`;

const StyledDescription = styled.div`
  padding-bottom: ${units(2)};
`;

class WebPageMediaCard extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(nextProps, this.props) || !deepEqual(nextState, this.state);
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
    } = this.props;

    const media_embed = media.media.metadata;

    return (
      <article className="web-page-media-card">
        {this.canEmbedHtml() ?
          <div
            dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
              __html: media_embed.html,
            }}
          />
          :
          <div>
            { media.description ?
              <StyledDescription>
                <ParsedText text={truncateLength(media.description, 250)} />
              </StyledDescription> : null
            }
            { media.picture ?
              <AspectRatio>
                <img src={media.picture} alt="" />
              </AspectRatio> : null
            }
            { media.metadata.url ?
              <StyledLink>
                <ExternalLink url={media.metadata.url}>
                  {media.metadata.url}
                </ExternalLink>
              </StyledLink> : null
            }
          </div>
        }
      </article>
    );
  }
}

export default injectIntl(WebPageMediaCard);
