import React, { Component } from 'react';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';
import Relay from 'react-relay';
import mergeWith from 'lodash.mergewith';
import xor from 'lodash.xor';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import CreateTagMutation from '../../relay/CreateTagMutation';
import DeleteTagMutation from '../../relay/DeleteTagMutation';
import Tags from '../Tags';
import CheckContext from '../../CheckContext';
import { searchQueryFromUrl, urlFromSearchQuery } from '../Search';
import { units, caption, opaqueBlack54, body2, black16, black87, checkBlue, borderWidthSmall, chipStyles } from '../../styles/js/shared';

const messages = defineMessages({
  loading: {
    id: 'mediaTags.loading',
    defaultMessage: 'Loading...',
  },
  language: {
    id: 'mediaTags.language',
    defaultMessage: 'language: {language}',
  },
  error: {
    id: 'mediaTags.error',
    defaultMessage: 'Sorry – we had trouble adding that tag.',
  },
});

const StyledMediaTagsContainer = styled.div`
  .media-tags {
    &:empty {
      display: none;
    }

    &--editing {
      margin: ${units(1)} 0;
      width: 100%;
    }
  }

  .media-tags__header {
    // TODO remove in markup
    display: none;
  }

  .media-tags__heading {
    margin-bottom: 1px;
    margin-top: 4px;
    text-transform: uppercase;
    margin: 0;
    margin-${props => (props.isRtl ? 'right' : 'left')}: ${units(2)};
  }

  .media-tags__message {
    font: ${caption};
    margin: 0;
  }

  .media-tags__suggestions {
    display: inline-block;
    margin-top: ${units(1)};
    margin: 0;
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(1)};
  }

  .media-tags__tag,
  .media-tags__suggestion {
    ${chipStyles}
  }

  .media-tags__tag {
    svg {
      color: ${opaqueBlack54};
      margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(1)};
    }
  }

  .media-tags .tags-list .ReactTags__tag {
    ${chipStyles}
    min-width: ${units(7)};
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
  }

  // TODO standardize with other form inputs — CGB 2017-3-12
  .media-tags .tags-list input {
    border-bottom: ${borderWidthSmall} solid ${black16} !important;
    border-width: 0;
    color: ${black87};
    font: ${body2};
    margin: ${units(1)} 0;
    padding: ${units(1)} 0;
    width: 100%;

    &:focus {
      border-bottom-color: ${checkBlue} !important;
      outline: none;
    }
  }

  button.ReactTags__remove {
    background-color: transparent;
    border: 0;
    font-size: 1em;
  }

`;

class MediaTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
    };
  }

  findTag(tagString) {
    return this.props.tags.find(tag => tag.node && tag.node.tag === tagString);
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  handleSuggestedTagEditClick(tagString) {
    this.setState({ message: this.props.intl.formatMessage(messages.loading) });
    const tag = this.findTag(tagString);

    if (tag) {
      this.deleteTag(tag.node.id);
    } else {
      this.createTag(tagString);
    }
  }

  createTag(tagString) {
    const that = this;
    const { media } = this.props;
    const context = new CheckContext(this).getContextStore();

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.error);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
      that.setState({ message });
    };

    const onSuccess = () => {
      that.setState({ message: null });
    };

    Relay.Store.commitUpdate(
      new CreateTagMutation({
        annotated: media,
        annotator: context.currentUser,
        parent_type: 'project_media',
        context,
        annotation: {
          tag: tagString.trim(),
          annotated_type: 'ProjectMedia',
          annotated_id: media.dbid,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  deleteTag(tagId) {
    const { media } = this.props;
    Relay.Store.commitUpdate(
      new DeleteTagMutation({
        annotated: media,
        parent_type: 'project_media',
        id: tagId,
      }),
    );
  }

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
    });
    if (!query.tags.length) delete query.tags;
    return urlFromSearchQuery(query, `/${media.team.slug}/search`);
  }

  handleTagViewClick(tagString) {
    const url = this.searchTagUrl(tagString);
    const history = new CheckContext(this).getContextStore().history;
    history.push(url);
  }

  render() {
    const { media, tags } = this.props;
    const suggestedTags = media.team && media.team.get_suggested_tags
      ? media.team.get_suggested_tags.split(',')
      : [];
    const activeSuggestedTags = tags.filter(tag => suggestedTags.includes(tag.node.tag));
    const remainingTags = tags.filter(tag => !suggestedTags.includes(tag.node.tag));
    const searchQuery = searchQueryFromUrl();
    const activeRegularTags = searchQuery.tags || [];

    if (!this.props.isEditing) {
      return (
        <StyledMediaTagsContainer isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
          <div className="media-tags">
            {activeSuggestedTags.length
              ? <ul className="media-tags__suggestions">
                {activeSuggestedTags.map(tag =>
                  <li
                    key={tag.node.id}
                    onClick={this.handleTagViewClick.bind(this, tag.node.tag)}
                    className={this.bemClass(
                        'media-tags__suggestion',
                        activeRegularTags.indexOf(tag.node.tag) > -1,
                        '--selected',
                      )}
                  >
                    {tag.node.tag}
                  </li>,
                  )}
              </ul>
              : null}
            <ul className="media-tags__list">
              {media.language
                ? <li className="media-tags__tag media-tags__language">
                  {this.props.intl.formatMessage(messages.language, { language: media.language })}
                </li>
                : null}
              {remainingTags.map(tag =>
                <li
                  key={tag.node.id}
                  onClick={this.handleTagViewClick.bind(this, tag.node.tag)}
                  className={this.bemClass(
                    'media-tags__tag',
                    activeRegularTags.indexOf(tag.node.tag) > -1,
                    '--selected',
                  )}
                >
                  {tag.node.tag.replace(/^#/, '')}
                </li>,
              )}
            </ul>
          </div>
        </StyledMediaTagsContainer>
      );
    }

    return (
      <StyledMediaTagsContainer>
        <div className="media-tags media-tags--editing">
          <div className="media-tags__header">
            <h4 className="media-tags__heading">
              <FormattedMessage id="mediaTags.heading" defaultMessage="Tags" />
            </h4>
            <span className="media-tags__message">{this.state.message}</span>
          </div>

          {suggestedTags.length
            ? <div className="media-tags__suggestions">
              <ul className="media-tags__suggestions-list">
                {suggestedTags.map(suggestedTag =>
                  <li
                    key={suggestedTag}
                    onClick={this.handleSuggestedTagEditClick.bind(this, suggestedTag)}
                    className={this.bemClass(
                        'media-tags__suggestion',
                        this.findTag(suggestedTag),
                        '--selected',
                      )}
                  >
                    {suggestedTag}
                  </li>,
                  )}
              </ul>
            </div>
            : null}

          <Tags tags={remainingTags} annotated={media} annotatedType="ProjectMedia" />
        </div>

      </StyledMediaTagsContainer>
    );
  }
}

MediaTags.propTypes = {
  intl: intlShape.isRequired,
};

MediaTags.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(MediaTags);
