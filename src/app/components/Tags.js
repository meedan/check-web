import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import Relay from 'react-relay/classic';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from '@material-ui/core/Chip';
import CreateTagMutation from '../relay/mutations/CreateTagMutation';
import DeleteTagMutation from '../relay/mutations/DeleteTagMutation';
import CheckContext from '../CheckContext';
import globalStrings from '../globalStrings';
import { caption, StyledTagsWrapper } from '../styles/js/shared';
import { getErrorMessage } from '../helpers';
import { stringHelper } from '../customHelpers';

const messages = defineMessages({
  addTagHelper: {
    id: 'tags.addTagHelper',
    defaultMessage: 'Create a tag or choose from existing',
  },
  error: {
    id: 'tags.error',
    defaultMessage: 'Sorry, an error occurred while updating the tag. Please try again and contact {supportEmail} if the condition persists.',
  },
});

class Tags extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // False positive by eslint: searchText is used by this.autoComplete
      // eslint-disable-next-line react/no-unused-state
      searchText: '',
    };
  }

  handleAddition(tags) {
    if (!this.props.annotated || !this.props.annotatedType) return;

    const tagsList = [...new Set(tags.split(','))];

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message });
    };

    const onSuccess = (data) => {
      this.setState({ message: null });
      const pm = data.createTag.project_media;
      let path = '';
      let currentProjectId = window.location.pathname.match(/project\/([0-9]+)/);
      if (currentProjectId) {
        [path, currentProjectId] = currentProjectId;
      }
      if (pm.project_id && currentProjectId &&
        parseInt(pm.project_id, 10) !== parseInt(currentProjectId, 10)) {
        const newPath = window.location.pathname.replace(path, `project/${pm.project_id}`);
        window.location.assign(newPath);
      }
    };

    const context = new CheckContext(this).getContextStore();

    tagsList.forEach((tag) => {
      Relay.Store.commitUpdate(
        new CreateTagMutation({
          annotated: this.props.annotated,
          annotator: context.currentUser,
          parent_type: this.props.annotatedType.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
          context,
          annotation: {
            tag: tag.trim(),
            annotated_type: this.props.annotatedType,
            annotated_id: this.props.annotated.dbid,
          },
        }),
        { onSuccess, onFailure },
      );
    });
  }

  handleDelete(id) {
    if (!this.props.annotated || !this.props.annotatedType) return;

    Relay.Store.commitUpdate(new DeleteTagMutation({
      annotated: this.props.annotated,
      parent_type: this.props.annotatedType.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
      id,
    }));
  }

  renderTags() {
    const deleteCallback = (id) => {
      if (this.props.onDelete) this.props.onDelete(id);
      if (this.handleDelete) this.handleDelete(id);
    };

    return (
      <StyledTagsWrapper className="source-tags__tags">
        {this.props.tags.map((tag) => {
          if (tag.node.tag_text) {
            return (
              <Chip
                key={tag.node.id}
                className="source-tags__tag"
                onDelete={this.props.isEditing ?
                  () => { deleteCallback(tag.node.id); } : null
                }
                label={tag.node.tag_text.replace(/^#/, '')}
              />
            );
          }
          return null;
        })}
      </StyledTagsWrapper>
    );
  }

  renderTagsView() {
    return this.renderTags();
  }

  renderTagsEdit() {
    const selectCallback = (tag) => {
      if (this.props.onSelect) {
        this.props.onSelect(tag);
      } else {
        this.handleAddition(tag);
      }

      setTimeout(() => {
        this.autoComplete.setState({ searchText: '' });
      }, 500);
    };

    const updateCallback = (text) => {
      if (this.props.onChange) {
        this.props.onChange(text);
      }
    };

    return (
      <div>
        <AutoComplete
          id="sourceTagInput"
          name="sourceTagInput"
          errorText={this.state.message || this.props.errorText}
          filter={AutoComplete.caseInsensitiveFilter}
          floatingLabelText={this.props.intl.formatMessage(globalStrings.tags)}
          dataSource={this.props.options}
          openOnFocus
          onNewRequest={selectCallback}
          ref={(a) => { this.autoComplete = a; }}
          fullWidth
          onUpdateInput={(text) => { updateCallback(text); }}
        />
        <div className="source__helper" style={{ font: caption }}>
          {this.props.helperText || this.props.intl.formatMessage(messages.addTagHelper)}
        </div>
        {this.renderTags()}
      </div>
    );
  }

  render() {
    return (this.props.isEditing ? this.renderTagsEdit() : this.renderTagsView());
  }
}

Tags.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(Tags);
