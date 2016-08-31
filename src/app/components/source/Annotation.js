import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Card from 'material-ui/lib/card/card';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import CardActions from 'material-ui/lib/card/card-actions';
import FlatButton from 'material-ui/lib/flat-button';
import TimeAgo from 'react-timeago';
import DeleteAnnotationMutation from '../../relay/DeleteAnnotationMutation';

class Annotation extends Component {
  handleDelete(id) {
    Relay.Store.commitUpdate(
      new DeleteAnnotationMutation({
        parent_type: this.props.annotatedType.toLowerCase(),
        annotated: this.props.annotated,
        id: id
      })
    );
  }

  render() {
    const annotation = this.props.annotation;

    // Display is different, based on annotation type
    let content = JSON.parse(annotation.content);
    switch (annotation.annotation_type) {
      case 'comment':
        content = content.text;
        break;
      case 'tag':
        content = 'Tagged as "' + content.tag + '"'
        break;
      case 'status':
        content = 'Status set to "' + content.status + '"'
        break;
      case 'flag':
        content = 'Flagged as "' + content.flag + '"'
        break;
      default:
        content = annotation.content;
    }

    return (
      <div className="annotation">
        <Card>
          <CardHeader title={annotation.annotator.name} subtitle={<TimeAgo date={annotation.created_at} live={false} />} 
                      avatar={annotation.annotator.profile_image} />
          <CardText>{content}</CardText>
          <CardActions>
            <FlatButton label="Delete" onClick={this.handleDelete.bind(this, annotation.id)} className="delete-annotation" />
          </CardActions>
        </Card>
      </div>
    );
  }
}

export default Annotation;
