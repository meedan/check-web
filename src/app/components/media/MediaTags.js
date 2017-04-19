import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';
import Relay from 'react-relay';
import CreateTagMutation from '../../relay/CreateTagMutation';
import DeleteTagMutation from '../../relay/DeleteTagMutation';
import Tags from '../source/Tags';
import CheckContext from '../../CheckContext';
import { Link } from 'react-router';
import { searchQueryFromUrl, urlFromSearchQuery } from '../Search';
import mergeWith from 'lodash.mergewith';
import xor from 'lodash.xor';
import isEqual from 'lodash.isequal';

const messages = defineMessages({
  loading: {
    id: 'mediaTags.loading',
    defaultMessage: 'Loading...',
  },
  error: {
    id: 'mediaTags.error',
    defaultMessage: 'Sorry – we had trouble adding that tag.',
  },
});

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

  handleClick(tagString) {
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
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
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
      tags: [ tagString ]
    };
    const searchQuery = searchQueryFromUrl();

    // Make a new query combining the current tag with whatever query is already in the URL.
    // This allows to support clicking tags on the search and project pages.
    const query = mergeWith({}, searchQuery, tagQuery, function (objValue, srcValue) {
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
    const suggestedTags = (media.team && media.team.get_suggested_tags) ? media.team.get_suggested_tags.split(',') : [];
    const activeSuggestedTags = tags.filter(tag => suggestedTags.includes(tag.node.tag));
    const remainingTags = tags.filter(tag => !suggestedTags.includes(tag.node.tag));

    if (!this.props.isEditing) {
      return (
        <div className="media-tags">
          {activeSuggestedTags.length ? (
            <ul className="media-tags__suggestions / electionland_categories">
              {activeSuggestedTags.map(tag =>
                <li key={tag.node.id}
                    onClick={this.handleTagViewClick.bind(this, tag.node.tag)}
                    className={this.bemClass('media-tags__suggestion', activeRegularTags.indexOf(tag.node.tag) > -1, '--selected')}>
                    {tag.node.tag}
                </li>
              )}
            </ul>
          ) : null}
          <ul className="media-tags__list">
            {media.language ? <li className="media-tags__tag">{`source:${media.language}`}</li> : null}
            {remainingTags.map(tag =>
              <li key={tag.node.id}
                  onClick={this.handleTagViewClick.bind(this, tag.node.tag)}
                  className={this.bemClass('media-tags__tag', activeRegularTags.indexOf(tag.node.tag) > -1, '--selected')}>
                  {tag.node.tag.replace(/^#/, '')}
              </li>
            )}
          </ul>
        </div>
      );
    }

    return (
      <div className="media-tags media-tags--editing">
        <div className="media-tags__header">
          <h4 className="media-tags__heading"><FormattedMessage id="mediaTags.heading" defaultMessage="Tags" /></h4>
          <span className="media-tags__message">{this.state.message}</span>
        </div>

        {suggestedTags.length ? (
          <div className="media-tags__suggestions">
            <ul className="media-tags__suggestions-list / electionland_categories">
              {suggestedTags.map(suggestedTag =>
                <li key={suggestedTag}
                    onClick={this.handleSuggestedTagEditClick.bind(this, suggestedTag)}
                    className={this.bemClass('media-tags__suggestion', this.findTag(suggestedTag), '--selected')}>
                    {suggestedTag}
                </li>
              )}
            </ul>
          </div>
        ) : null}

        <Tags tags={remainingTags} annotated={media} annotatedType="ProjectMedia" />
      </div>
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
