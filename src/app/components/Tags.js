import React from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import Relay from 'react-relay';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import CreateTagMutation from '../relay/CreateTagMutation';
import DeleteTagMutation from '../relay/DeleteTagMutation';
import CheckContext from '../CheckContext';
import globalStrings from '../globalStrings';
import { caption, StyledTagsWrapper } from '../styles/js/shared';

const messages = defineMessages({
  addTagHelper: {
    id: 'tags.addTagHelper',
    defaultMessage: 'Create a tag or choose from existing',
  },
  error: {
    id: 'tags.error',
    defaultMessage: 'Sorry, could not create the tag',
  },
});

class Tags extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
    };
  }

  handleAddition(tags) {
    const props = this.props;

    if (!props.annotated || !props.annotatedType) { return; }

    let tagsList = [...new Set(tags.split(','))];

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.error);

      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }

      this.setState({ message });
    };

    const onSuccess = (response) => {
      this.setState({ message: null });
    };

    const context = new CheckContext(this).getContextStore();

    tagsList.map((tag) => {
      Relay.Store.commitUpdate(
        new CreateTagMutation({
          annotated: props.annotated,
          annotator: context.currentUser,
          parent_type: props.annotatedType.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
          context,
          annotation: {
            tag: tag.trim(),
            annotated_type: props.annotatedType,
            annotated_id: props.annotated.dbid,
          },
        }),
        { onSuccess, onFailure },
      );
    });
  }

  handleDelete(id) {
    const props = this.props;

    if (!props.annotated || !props.annotatedType) { return; }

    Relay.Store.commitUpdate(
      new DeleteTagMutation({
        annotated: props.annotated,
        parent_type: props.annotatedType.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
        id,
      }),
    );
  }

  renderTags() {
    const tags = this.props.tags;

    const deleteCallback = (id) => {
      (this.props.onDelete && this.props.onDelete(id)) ||
      (this.handleDelete && this.handleDelete(id));
    };

    return (
      <StyledTagsWrapper className="source-tags__tags">
        {tags.map(tag =>
          <Chip
            key={tag.node.id}
            className="source-tags__tag"
            onRequestDelete={ this.props.isEditing ?
              () => { deleteCallback(tag.node.id); } : null
            }
          >
            {tag.node.tag.replace(/^#/, '')}
          </Chip>,
        )}
      </StyledTagsWrapper>
    );
  }

  renderTagsView() {
    return this.renderTags();
  }

  renderTagsEdit() {
    const selectCallback = (tag) => {
      this.props.onSelect ? this.props.onSelect(tag) :  this.handleAddition(tag);

      setTimeout(() => {
        this.refs.autocomplete.setState({ searchText: '' });
      }, 500);
    };

    const updateCallback = (text) => {
      this.props.onChange && this.props.onChange(text);
    };

    return (<div>
      <AutoComplete
        id="sourceTagInput"
        name="sourceTagInput"
        errorText={this.state.message || this.props.errorText}
        filter={AutoComplete.caseInsensitiveFilter}
        floatingLabelText={this.props.intl.formatMessage(globalStrings.tags)}
        dataSource={this.props.options}
        openOnFocus
        onNewRequest={selectCallback}
        ref={'autocomplete'}
        fullWidth
        onUpdateInput={(text) => { updateCallback(text); }}
      />
      <div className="source__helper" style={{font: caption}}>
        {this.props.intl.formatMessage(messages.addTagHelper)}
      </div>
      {this.renderTags()}
    </div>);
  }

  render() {
    return (this.props.isEditing ? this.renderTagsEdit() : this.renderTagsView());
  }
}

Tags.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(Tags);
