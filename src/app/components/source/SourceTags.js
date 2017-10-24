import React from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import globalStrings from '../../globalStrings';
import { StyledTagsWrapper } from '../../styles/js/shared';

const messages = defineMessages({
  addTagHelper: {
    id: 'sourceTags.addTagHelper',
    defaultMessage: 'Create a tag or choose from existing',
  },
});

class SourceTags extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
    };
  }

  renderTags() {
    const tags = this.props.tags;

    return (
      <StyledTagsWrapper className="source-tags__tags">
        {tags.map(tag =>
          <Chip
            key={tag.node.id}
            className="source-tags__tag"
            onRequestDelete={this.props.onDelete ? () => {
              this.props.onDelete(tag.node.id);
            } : null}
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
      this.props.onSelect(tag);

      setTimeout(() => {
        this.refs.autocomplete.setState({ searchText: '' });
      }, 500);
    };

    return (<div>
      <AutoComplete
        id="sourceTagInput"
        errorText={this.props.errorText}
        filter={AutoComplete.caseInsensitiveFilter}
        floatingLabelText={this.props.intl.formatMessage(globalStrings.tags)}
        dataSource={this.props.options}
        openOnFocus
        onNewRequest={selectCallback}
        ref={'autocomplete'}
        fullWidth
        textFieldStyle={{ width: '85%' }}
      />
      <div className="source__helper">
        {this.props.intl.formatMessage(messages.addTagHelper)}
      </div>
      {this.renderTags()}
    </div>);
  }

  render() {
    return (this.props.isEditing ? this.renderTagsEdit() : this.renderTagsView());
  }
}

export default injectIntl(SourceTags);
