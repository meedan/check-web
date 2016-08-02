import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { WithContext as ReactTags } from 'react-tag-input';
import CreateTagMutation from '../../relay/CreateTagMutation';
import DeleteTagMutation from '../../relay/DeleteTagMutation';

class Tags extends Component {
  handleDelete(i) {
    const props = this.props;
    Relay.Store.commitUpdate(
      new DeleteTagMutation({
        annotated: props.annotated,
        id: props.tags[i].node.id
      })
    );
  }
  
  handleAddition(tag) {
    const props = this.props;
    Relay.Store.commitUpdate(
      new CreateTagMutation({
        annotated: props.annotated,
        annotation: {
          tag: tag,
          annotated_type: props.annotatedType,
          annotated_id: props.annotated.dbid
        }
      })
    );
  }

  render() {
    let tags = [];
    this.props.tags.map(function(tag) {
      tags.push({ id: tag.node.id, text: tag.node.tag });
    });

    return (
      <div className="tags-list">
        <span className="tags-title">Tags</span>
        <ReactTags tags={tags} handleDelete={this.handleDelete.bind(this)} handleAddition={this.handleAddition.bind(this)} autofocus={false} />
        <br />
      </div>
    );
  }
}

export default Tags;
