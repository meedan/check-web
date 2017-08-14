import React from 'react';
import { injectIntl } from 'react-intl';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import globalStrings from '../../globalStrings';

class SourceTags extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
    };
  }

  renderTags(){
    const tags = this.props.tags;

    return (
      <div className="source-tags__tags">
        {tags.map(tag =>
          <Chip key={tag.node.id}
            className="source-tags__tag"
            onRequestDelete={this.props.onDelete ? () => {
              this.props.onDelete(tag.node.id);
            } : null}
          >
            {tag.node.tag.replace(/^#/, '')}
          </Chip>
        )}
      </div>
    );
  }

  renderTagsView(){
    return this.renderTags();
  }

  renderTagsEdit(){
    const clearInput = () => {
      document.getElementById('sourceTagInput').value = "";
      this.setState({ searchText: '' });
    };

    const selectCallback = (tag) => {
      this.setState({ searchText: '' });
      clearInput();
      this.props.onSelect(tag);
    };

    return <div>
        <AutoComplete
          id="sourceTagInput"
          searchText={this.state.searchText}
          filter={AutoComplete.caseInsensitiveFilter}
          floatingLabelText={this.props.intl.formatMessage(globalStrings.tags)}
          dataSource={this.props.options}
          onFocus={clearInput}
          onNewRequest={selectCallback}
          ref={(input) => { this.textInput = input; }}
          fullWidth
        />
      {this.renderTags()}
    </div>;
  }

  render() {
    return (this.props.isEditing ? this.renderTagsEdit() : this.renderTagsView());
  }
}

export default injectIntl(SourceTags);
