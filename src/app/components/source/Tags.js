import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { WithContext as ReactTags } from 'react-tag-input';
import Message from '../Message';
import CreateTagMutation from '../../relay/CreateTagMutation';
import DeleteTagMutation from '../../relay/DeleteTagMutation';

class Tags extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null
    };
  }

  handleDelete(i) {
    const props = this.props;
    Relay.Store.commitUpdate(
      new DeleteTagMutation({
        annotated: props.annotated,
        parent_type: props.annotatedType.toLowerCase(),
        id: props.tags[i].node.id
      })
    );
  }
  
  handleAddition(tags) {
    const props = this.props;
    var tagsList = [ ...new Set(tags.split(',')) ],
        that = this;

    var onFailure = function(transaction) {
      let error = transaction.getError();
      let message = 'Sorry, could not create the tag';

      try {
        var json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }

      that.setState({ message: message });
    };
     
    var onSuccess = function(response) {
      that.setState({ message: null });
    };

    tagsList.map(function(tag) {
      Relay.Store.commitUpdate(
        new CreateTagMutation({
          annotated: props.annotated,
          parent_type: props.annotatedType.toLowerCase(),
          annotation: {
            tag: tag.trim(),
            annotated_type: props.annotatedType,
            annotated_id: props.annotated.dbid
          }
        }),
        { onSuccess, onFailure }
      );
    });
  }

  render() {
    let tags = [];
    this.props.tags.map(function(tag) {
      tags.push({ id: tag.node.id, text: tag.node.tag });
    });

    return (
      <div className="tags-list">
        <Message message={this.state.message} />
        <ReactTags tags={tags} handleDelete={this.handleDelete.bind(this)} handleAddition={this.handleAddition.bind(this)} autofocus={false} removeComponent={TagsRemove} />
      </div>
    );
  }
}

class TagsRemove extends React.Component {
  render() {
    return (<button {...this.props}>×</button>);
  }
}

export default Tags;
