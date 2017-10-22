import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import deepEqual from 'deep-equal';
import styled from 'styled-components';
import MediaUtil from './MediaUtil';
import ParsedText from '../ParsedText';
import { units, Row, Offset, black05, defaultBorderRadius, subheading1, caption } from '../../styles/js/shared';

const StyledImage = styled.img`
  border: 1px solid ${black05};
  border-radius: ${defaultBorderRadius};
  max-width: ${units(5)};
  max-height: ${units(5)};
  margin-top: 2px; // visual alignment
`;

const StyledSubheading = styled.h3`
  font: ${subheading1};
  font-weight: 500;
`;

const StyledLinkWrapper = styled.div`
  font: ${caption};
`;

class WebPageMediaCard extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(nextProps, this.props) || !deepEqual(nextState, this.state);
  }

  render() {
    const { media, data, heading, isRtl, authorName, authorUsername } = this.props;
    const url = MediaUtil.url(media, data);
    const hasUniqueAuthorUsername = ((authorName && authorUsername) && (authorName !== authorUsername));
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
              <StyledImage alt="" src={picture} />
            </Offset>
          : null }

          <Offset isRtl={isRtl}>

            { heading &&
              <StyledSubheading> {heading} </StyledSubheading>}

            { hasUniqueAuthorUsername
              ? <a href={data.author_url} target="_blank" rel="noopener noreferrer">
                {authorUsername}
              </a>
              : null
              }

            { data.description && <div><ParsedText text={data.description} /></div> }

            {data.url &&
              <StyledLinkWrapper>
                <a href={data.url} target="_blank" rel="noopener noreferrer">
                  {data.url}
                </a>
              </StyledLinkWrapper>}

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
