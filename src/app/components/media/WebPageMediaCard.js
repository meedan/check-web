import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import deepEqual from 'deep-equal';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import MediaUtil from './MediaUtil';
import TimeBefore from '../TimeBefore';
import ParsedText from '../ParsedText';
import { units, Row, Offset, black05, defaultBorderRadius, subheading1, black87, body2 } from '../../styles/js/shared';

const StyledImage = styled.img`
  border: 1px solid ${black05};
  border-radius: ${defaultBorderRadius};
  max-width: ${units(5)};
  max-height: ${units(5)};
`;

const StyledSubheading = styled.h2`
  font: ${subheading1};
  color: ${black87};
  margin: 0;
`;

const StyledLinkWrapper = styled.div`
  font: ${body2};
`;

class WebPageMediaCard extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(nextProps, this.props) || !deepEqual(nextState, this.state);
  }

  render() {
    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);
    const { media, data } = this.props;
    const url = MediaUtil.url(media, data);
    const embedPublishedAt = MediaUtil.embedPublishedAt(media, data);
    const authorName = MediaUtil.authorName(media, data);
    const authorUsername = MediaUtil.authorUsername(media, data);
    const picture = (() => {
      if (data.picture && !data.picture.match(/\/screenshots\//)) {
        return (data.picture);
      } else if (data.favicon) {
        return (data.favicon);
      }
      return (null);
    })();

    return (
      <article>
        <Row alignTop>

          {(picture) ?
            <Offset isRtl={isRtl}>
              <div>
                <StyledImage alt="" src={picture} />
              </div>
            </Offset>
          : null }

          <Offset isRtl={isRtl}>

            { (authorName || authorUsername) &&
              <StyledSubheading> {(authorName || authorUsername)} </StyledSubheading>}

            {data.author_url &&
              <StyledLinkWrapper>
                <a href={data.author_url} target="_blank" rel="noopener noreferrer">
                  {data.author_url}
                </a>
              </StyledLinkWrapper>}

            { ((authorName && authorUsername) && (authorName !== authorUsername))
              ? <a href={data.author_url} target="_blank" rel="noopener noreferrer">
                {authorUsername}
              </a>
              : null
              }

            { data.description && <div><ParsedText text={data.description} /></div> }

            {embedPublishedAt && <a href={url} target="_blank" rel="noopener noreferrer">
              <TimeBefore date={embedPublishedAt} /> </a>}
          </Offset>

        </Row>
      </article>
    );
  }
}

WebPageMediaCard.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(WebPageMediaCard);
