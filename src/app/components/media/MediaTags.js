import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CreateTagMutation from '../../relay/CreateTagMutation';
import DeleteTagMutation from '../../relay/DeleteTagMutation';
import Tags from '../source/Tags';
import CheckContext from '../../CheckContext';

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
    this.setState({ message: 'Loading...' });
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
      let message = 'Sorry – we had trouble adding that tag.';
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
        parent_type: 'media',
        context,
        annotation: {
          tag: tagString.trim(),
          annotated_type: 'Media',
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
        parent_type: 'media',
        id: tagId,
      }),
    );
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
              {activeSuggestedTags.map(tag => <li className={this.bemClass('media-tags__suggestion', true, '--selected')}>{tag.node.tag}</li>)}
            </ul>
          ) : null}
          {remainingTags.length ? <ul className="media-tags__list">
            {remainingTags.map(tag => (<li className="media-tags__tag">{tag.node.tag.replace(/^#/, '')}</li>))}
          </ul> : null}
        </div>
      );
    }

    return (
      <div className="media-tags media-tags--editing">
        <div className="media-tags__header">
          <h4 className="media-tags__heading">Tags</h4>
          <span className="media-tags__message">{this.state.message}</span>
        </div>

        {suggestedTags.length ? (
          <div className="media-tags__suggestions">
            <ul className="media-tags__suggestions-list / electionland_categories">
              {suggestedTags.map(suggestedTag => <li onClick={this.handleClick.bind(this, suggestedTag)} className={this.bemClass('media-tags__suggestion', this.findTag(suggestedTag), '--selected')}>{suggestedTag}</li>)}
            </ul>
          </div>
        ) : null}

        <Tags tags={remainingTags} annotated={media} annotatedType="Media" />
      </div>
    );
  }
}

MediaTags.contextTypes = {
  store: React.PropTypes.object,
};

export default MediaTags;
