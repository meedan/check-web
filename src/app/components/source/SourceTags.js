import React from 'react';
import Chip from 'material-ui/Chip';

class SourceTags extends React.Component {
  render() {
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
}

export default SourceTags;
