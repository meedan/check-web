import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router';
import deepEqual from 'deep-equal';
import styled from 'styled-components';
import MediaUtil from './MediaUtil';
import ParsedText from '../ParsedText';
import {
  units,
  Row,
  Offset,
  black05,
  black87,
  subheading1,
  defaultBorderRadius,
} from '../../styles/js/shared';

// If there is an AuthorPicture
// as a large icon or small favicon
const StyledAuthorImage = styled.img`
  border: 1px solid ${black05};
  border-radius: ${defaultBorderRadius};
  max-width: ${units(10)};
  max-height: ${units(10)};
  margin-top: 2px; // visual alignment
`;

// If it is a link to a jpg, png, or gif
const StyledContentImage = styled.img`
  border: 1px solid ${black05};
  border-radius: ${defaultBorderRadius};
  max-width: 100%;
  max-height: ${units(60)};
  margin-top: ${units(1)};
`;

const StyledHeading = styled.h3`
  font: ${subheading1};
  font-weight: 500;
  &,
  a,
  a:visited {
    color: ${black87} !important;
  }
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
      media, mediaUrl, data, isRtl, authorName, authorUsername,
    } = this.props;

    const url = MediaUtil.url(media, data);
    const authorPictureUrl = (() => {
      if (data.picture && !data.picture.match(/\/screenshots\//)) {
        return (data.picture);
      } else if (data.favicon) {
        return (data.favicon);
      }
      return (null);
    })();

    const authorPicture = (authorPictureUrl) ? (
      <Offset isRtl={isRtl}>
        <StyledAuthorImage alt="" src={authorPictureUrl} />
      </Offset>)
      : null;

    // TODO Move webPageName logic to Pender
    const hasUniqueAuthorUsername =
      (authorName && authorUsername && (authorName !== authorUsername));
    const webPageName = hasUniqueAuthorUsername ? (
      <a href={data.author_url} target="_blank" rel="noopener noreferrer">
        {authorUsername}
      </a>)
      : null;

    const imageRegex = /\/.*\.(gifv?|jpe?g|png)(\?|#)?.*$/;
    const contentPicture = (() => {
      if (url && url.match(imageRegex)) {
        return (<StyledContentImage src={url} alt="" />);
      }
      return (null);
    })();
    const media_embed = media.media.metadata;
    const heading = (
      <StyledHeading className="media__heading">
        <Link to={mediaUrl}>
          {media_embed.title}
        </Link>
      </StyledHeading>
    );

    return (
      <article>
        {this.canEmbedHtml() ?
          <div
            dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
              __html: media_embed.html,
            }}
          />
          :
          <Row alignTop>
            { authorPicture }
            <Offset isRtl={isRtl}>
              { heading }
              { webPageName }
              { media_embed.description ?
                <div><ParsedText text={media_embed.description} /></div>
                : null }
              { contentPicture }
            </Offset>
          </Row>}
      </article>
    );
  }
}

export default injectIntl(WebPageMediaCard);
