import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import mergeWith from 'lodash.mergewith';
import xor from 'lodash.xor';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';
import Can from '../Can';
import CreateTagMutation from '../../relay/mutations/CreateTagMutation';
import DeleteTagMutation from '../../relay/mutations/DeleteTagMutation';
import UpdateLanguageMutation from '../../relay/mutations/UpdateLanguageMutation';
import LanguageSelector from '../LanguageSelector';
import Tags from '../Tags';
import CheckContext from '../../CheckContext';
import { searchQueryFromUrl, urlFromSearchQuery } from '../search/Search';
import { getErrorMessage, bemClass } from '../../helpers';
import {
  units,
  caption,
  opaqueBlack54,
  opaqueBlack05,
  chipStyles,
} from '../../styles/js/shared';
import { stringHelper } from '../../customHelpers';

const messages = defineMessages({
  loading: {
    id: 'mediaTags.loading',
    defaultMessage: 'Loading...',
  },
  language: {
    id: 'mediaTags.language',
    defaultMessage: 'Language: {language}',
  },
  error: {
    id: 'mediaTags.error',
    defaultMessage: 'Sorry, an error occurred while updating the tag. Please try again and contact {supportEmail} if the condition persists.',
  },
});

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
    margin-${props => (props.isRtl ? 'left' : 'right')}: 0 !important;
    margin-${props => (props.isRtl ? 'right' : 'left')}: ${units(1)};
  }
`;

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
    // TODO Remove in markup
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
`;

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
class MediaTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      correctingLanguage: false,
    };
  }

  findTag(tagString) {
    return this.props.tags.find(tag => tag.node && tag.node.tag_text === tagString);
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

  fail = (transaction) => {
    this.setState({
      errorMessage: getErrorMessage(
        transaction,
        this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') }),
      ),
    });
  };

  success = () => {
    this.setState({ message: null, errorMessage: null });
  };

  createTag(tagString) {
    const { media } = this.props;
    const context = new CheckContext(this).getContextStore();
    const onSuccess = () => this.success();
    const onFailure = transaction => this.fail(transaction);

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
    const onSuccess = () => this.success();
    const onFailure = transaction => this.fail(transaction);

    Relay.Store.commitUpdate(
      new DeleteTagMutation({
        annotated: media,
        parent_type: 'project_media',
        id: tagId,
      }),
      { onSuccess, onFailure },
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
      return undefined;
    });
    if (!query.tags.length) {
      delete query.tags;
    }
    return urlFromSearchQuery(query, `/${media.team.slug}/search`);
  }

  handleCorrectLanguageCancel() {
    this.setState({ correctingLanguage: false });
  }

  handleCorrectLanguage() {
    this.setState({ correctingLanguage: true });
  }

  handleLanguageChange(e) {
    this.handleLanguageSubmit(e);
  }

  handleLanguageSubmit(e) {
    const { media } = this.props;
    const onSuccess = () => {
      this.setState({ correctingLanguage: false });
      this.success();
    };
    const onFailure = transaction => this.fail(transaction);

    Relay.Store.commitUpdate(
      new UpdateLanguageMutation({
        id: media.dynamic_annotation_language.id,
        projectMediaId: media.id,
        languageCode: e.target.value,
        languageName: e.target.selectedOptions[0].innerText,
      }),
      { onSuccess, onFailure },
    );
  }

  handleTagViewClick(tagString) {
    const url = this.searchTagUrl(tagString);
    const { history } = new CheckContext(this).getContextStore();
    history.push(url);
  }

  render() {
    const { media, tags } = this.props;
    const suggestedTags = media.team && media.team.get_suggested_tags
      ? media.team.get_suggested_tags.split(',')
      : [];
    const activeSuggestedTags = tags.filter(tag => suggestedTags.includes(tag.node.tag_text));
    const remainingTags = tags.filter(tag => !suggestedTags.includes(tag.node.tag_text));
    const searchQuery = searchQueryFromUrl();
    const activeRegularTags = searchQuery.tags || [];
    const updateCallback = (text) => {
      if (this.props.onChange) {
        this.props.onChange(text);
      }
    };

    if (!this.props.isEditing) {
      return (
        <StyledMediaTagsContainer isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
          <div className="media-tags">
            {activeSuggestedTags.length ?
              <ul className="media-tags__suggestions">
                {activeSuggestedTags.map(tag => (
                  <li
                    key={tag.node.id}
                    onClick={this.handleTagViewClick.bind(this, tag.node.tag_text)}
                    className={bemClass(
                      'media-tags__suggestion',
                      activeRegularTags.indexOf(tag.node.tag_text) > -1,
                      '--selected',
                    )}
                  >
                    {tag.node.tag_text}
                  </li>))}
              </ul>
              : null}
            <ul className="media-tags__list">
              {media.language ?
                <li className="media-tags__tag media-tags__language">
                  {this.state.correctingLanguage ?
                    <span>
                      {this.props.intl.formatMessage(messages.language, { language: '' })}
                      {' '}
                      <StyledLanguageSelect>
                        <LanguageSelector
                          onChange={this.handleLanguageChange.bind(this)}
                          project={media.project}
                          selected={media.language_code}
                        />
                      </StyledLanguageSelect>
                      {' '}
                      <StyledLanguageIcon>
                        <CancelIcon
                          onClick={this.handleCorrectLanguageCancel.bind(this)}
                        />
                      </StyledLanguageIcon>
                    </span> :
                    <span>
                      {this.props.intl.formatMessage(
                        messages.language,
                        { language: media.language },
                      )}
                      <Can permissions={media.permissions} permission="create Dynamic">
                        <StyledLanguageIcon>
                          <EditIcon
                            onClick={this.handleCorrectLanguage.bind(this)}
                          />
                        </StyledLanguageIcon>
                      </Can>
                    </span>
                  }
                </li>
                : null}
              {remainingTags.map((tag) => {
                if (tag.node.tag_text) {
                  return (
                    <li
                      key={tag.node.id}
                      onClick={this.handleTagViewClick.bind(this, tag.node.tag_text)}
                      className={bemClass(
                        'media-tags__tag',
                        activeRegularTags.indexOf(tag.node.tag_text) > -1,
                        '--selected',
                      )}
                    >
                      {tag.node.tag_text.replace(/^#/, '')}
                    </li>
                  );
                }
                return null;
              })}
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

          {suggestedTags.length ?
            <div className="media-tags__suggestions">
              <ul className="media-tags__suggestions-list">
                {suggestedTags.map(suggestedTag => (
                  <li
                    key={suggestedTag}
                    onClick={this.handleSuggestedTagEditClick.bind(this, suggestedTag)}
                    className={bemClass(
                      'media-tags__suggestion',
                      this.findTag(suggestedTag),
                      '--selected',
                    )}
                  >
                    {suggestedTag}
                  </li>))}
              </ul>
            </div>
            : null}

          <Tags
            tags={remainingTags}
            errorText={this.state.errorMessage || this.props.errorText}
            helperText={this.state.message}
            options={[]}
            annotated={media}
            annotatedType="ProjectMedia"
            isEditing
            onChange={(text) => { updateCallback(text); }}
          />
        </div>

      </StyledMediaTagsContainer>
    );
  }
}

MediaTags.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

MediaTags.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(MediaTags);
