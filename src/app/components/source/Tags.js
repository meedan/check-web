import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { WithContext as ReactTags } from 'react-tag-input';
import Message from '../Message';
import CreateTagMutation from '../../relay/CreateTagMutation';
import DeleteTagMutation from '../../relay/DeleteTagMutation';
import CheckContext from '../../CheckContext';

class Tags extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
    };
  }

  handleDelete(i) {
    const props = this.props;
    Relay.Store.commitUpdate(
      new DeleteTagMutation({
        annotated: props.annotated,
        parent_type: props.annotatedType.toLowerCase(),
        id: props.tags[i].node.id,
      }),
    );
  }

  handleAddition(tags) {
    const props = this.props;
    let tagsList = [...new Set(tags.split(','))],
      that = this;

    const onFailure = function (transaction) {
      const error = transaction.getError();
      let message = 'Sorry, could not create the tag';

      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }

      that.setState({ message });
    };

    const onSuccess = function (response) {
      that.setState({ message: null });
    };

    const context = new CheckContext(this).getContextStore();

    tagsList.map((tag) => {
      Relay.Store.commitUpdate(
        new CreateTagMutation({
          annotated: props.annotated,
          parent_type: props.annotatedType.toLowerCase(),
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

  render() {
    const tags = [];
    this.props.tags.map((tag) => {
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

Tags.contextTypes = {
  store: React.PropTypes.object,
};

class TagsRemove extends React.Component {
  render() {
    return (<button {...this.props}>×</button>);
  }
}

export default Tags;
