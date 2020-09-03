import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Relay from 'react-relay/classic';
import mergeWith from 'lodash.mergewith';
import xor from 'lodash.xor';
import memoize from 'memoize-one';
import styled from 'styled-components';
import Chip from '@material-ui/core/Chip';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';
import { withStyles } from '@material-ui/core/styles';
import Can from '../Can';
import UpdateLanguageMutation from '../../relay/mutations/UpdateLanguageMutation';
import LanguageSelector from '../LanguageSelector';
import { searchQueryFromUrl, urlFromSearchQuery } from '../search/Search';
import { withSetFlashMessage } from '../FlashMessage';
import { getErrorMessage } from '../../helpers';
import {
  units,
  opaqueBlack54,
  opaqueBlack05,
} from '../../styles/js/shared';
import { stringHelper } from '../../customHelpers';
import VideoAnnotationIcon from '../../../assets/images/video-annotation/video-annotation';

const StyledLanguageSelect = styled.span`
  select {
    background: ${opaqueBlack05};
    color: ${opaqueBlack54};
    border: 1px solid ${opaqueBlack54};
    padding: 1px;
    outline: 0;
    font-size: 14px;
  }
`;

const StyledLanguageIcon = styled.span`
  svg {
    width: 16px;
    height: 16px;
    vertical-align: middle;
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: 0 !important;
    margin-${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: ${units(1)};
  }
`;

const StyledMediaTagsContainer = styled.div`
  width: 100%;

  .media-tags {
    &:empty {
      display: none;
    }
  }

  .media-tags__language {
    white-space: nowrap;
  }

  .media-tags__list {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    list-style: none;
    padding: ${units(0.5)};
    margin: 0;

    li {
      margin: ${units(0.5)};
    }
  }
`;

const StyledLanguageChip = withStyles({
  label: {
    '& span': {
      display: 'flex',
      alignItems: 'center',
    },
  },
})(Chip);

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
class MediaTags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      correctingLanguage: false,
    };
  }

  fail = (transaction) => {
    const fallbackMessage = (
      <FormattedMessage
        id="mediaTags.error"
        defaultMessage="Sorry, an error occurred while updating the tag. Please try again and contact {supportEmail} if the condition persists."
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const errorMessage = getErrorMessage(transaction, fallbackMessage);
    this.props.setFlashMessage(errorMessage);
  };

  filterTags = memoize((tags) => {
    const splitTags = {
      regularTags: [],
      videoTags: [],
    };
    const fragments = {};

    // Get regular tags and cluster video tags by tag_text
    if (Array.isArray(tags)) {
      tags.forEach((t) => {
        if (t.node.fragment) {
          if (!fragments[t.node.tag_text]) {
            fragments[t.node.tag_text] = [];
          }
          fragments[t.node.tag_text].push(t);
        } else {
          splitTags.regularTags.push(t);
        }
      });
    }

    // Get the video tags with earliest timestamp
    Object.values(fragments).forEach((tagFragments) => {
      tagFragments.sort((a, b) => {
        const aStart = parseFloat(a.node.fragment.match(/\d+(\.\d+)?/)[0]);
        const bStart = parseFloat(b.node.fragment.match(/\d+(\.\d+)?/)[0]);
        return aStart - bStart;
      });

      splitTags.videoTags.push(tagFragments[0]);
    });

    return splitTags;
  });

  searchTagUrl(tagString) {
    const { media } = this.props;
    const tagQuery = {
      tags: [tagString],
    };
    const searchQuery = searchQueryFromUrl();

    // Make a new query combining the current tag with whatever query is already in the URL.
    // This allows to support clicking tags on the search and project pages.
    const query = mergeWith({}, searchQuery, tagQuery, (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return xor(objValue, srcValue);
      }
      return undefined;
    });
    if (!query.tags.length) {
      delete query.tags;
    }
    return urlFromSearchQuery(query, `/${media.team.slug}/all-items`);
  }

  handleCorrectLanguageCancel() {
    this.setState({ correctingLanguage: false });
  }

  handleCorrectLanguage() {
    this.setState({ correctingLanguage: true });
  }

  handleLanguageChange(value) {
    this.handleLanguageSubmit(value);
  }

  handleLanguageSubmit(value) {
    const { media } = this.props;
    const onSuccess = () => {
      this.setState({ correctingLanguage: false });
    };
    const onFailure = transaction => this.fail(transaction);

    Relay.Store.commitUpdate(
      new UpdateLanguageMutation({
        id: media.dynamic_annotation_language.id,
        projectMediaId: media.id,
        languageCode: value.languageCode,
        languageName: value.languageName,
      }),
      { onSuccess, onFailure },
    );
  }

  handleTagViewClick(tagString) {
    const url = this.searchTagUrl(tagString);
    browserHistory.push(url);
  }

  handleVideoAnnotationIconClick = (e, fragment) => {
    e.stopPropagation();
    if (this.props.onTimelineCommentOpen) {
      this.props.onTimelineCommentOpen(fragment);
    }
  };

  render() {
    const { media } = this.props;
    const { regularTags, videoTags } = this.filterTags(this.props.tags);
    const tags = regularTags.concat(videoTags);

    return (
      <StyledMediaTagsContainer className="media-tags__container">
        <div className="media-tags">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <ul className="media-tags__list">
                {tags.map((tag) => {
                  if (tag.node.tag_text) {
                    return (
                      <li key={tag.node.id}>
                        <Chip
                          icon={
                            tag.node.fragment ?
                              <VideoAnnotationIcon
                                onClick={e =>
                                  this.handleVideoAnnotationIconClick(e, tag.node.fragment)}
                              />
                              : null
                          }
                          className="media-tags__tag"
                          onClick={this.handleTagViewClick.bind(this, tag.node.tag_text)}
                          label={tag.node.tag_text.replace(/^#/, '')}
                        />
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              {media.language ?
                <ul className="media-tags__list">
                  <li>
                    <StyledLanguageChip
                      className="media-tags__tag media-tags__language"
                      label={
                        <FormattedMessage
                          className="media-tags__language-chip-label"
                          id="mediaTags.language"
                          defaultMessage="Language: {language}"
                          values={{
                            language: this.state.correctingLanguage ? (
                              <React.Fragment>
                                <StyledLanguageSelect>
                                  <LanguageSelector
                                    onChange={this.handleLanguageChange.bind(this)}
                                    team={media.team}
                                    selected={media.language_code}
                                  />
                                </StyledLanguageSelect>
                                {' '}
                                <StyledLanguageIcon>
                                  <CancelIcon
                                    onClick={this.handleCorrectLanguageCancel.bind(this)}
                                  />
                                </StyledLanguageIcon>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                {media.language}
                                <Can permissions={media.permissions} permission="create Dynamic">
                                  <StyledLanguageIcon>
                                    <EditIcon
                                      onClick={this.handleCorrectLanguage.bind(this)}
                                    />
                                  </StyledLanguageIcon>
                                </Can>
                              </React.Fragment>
                            ),
                          }}
                        />
                      }
                    />
                  </li>
                </ul>
                : null}
            </div>
          </div>
        </div>
      </StyledMediaTagsContainer>
    );
  }
}

MediaTags.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  media: PropTypes.object.isRequired,
  tags: PropTypes.arrayOf(PropTypes.shape({
    node: PropTypes.shape({
      tag: PropTypes.number.isRequired,
      id: PropTypes.string.isRequired,
      tag_text: PropTypes.string.isRequired,
    }),
  }).isRequired).isRequired,
};

export default withSetFlashMessage(MediaTags);
