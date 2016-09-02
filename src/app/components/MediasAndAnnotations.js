import React, { Component, PropTypes } from 'react';
import MediaCard from './media/MediaCard';
import Annotation from './source/Annotation';
import AddAnnotation from './source/AddAnnotation';

class MediasAndAnnotations extends Component {
  constructor(props) {
    super(props);
    this.state = { items: [] };
  }

  compare(a, b) {
    if (a.timestamp < b.timestamp) {
      return 1;
    }
    if (a.timestamp > b.timestamp) {
      return -1;
    }
    return 0;
  }

  sort(annotations, medias) {
    var items = [];
    
    annotations.forEach(function(annotation) {
      var item = annotation;
      item.itemType = 'annotation';
      item.timestamp = new Date(item.node.created_at).getTime();
      items.push(item);
    });
    
    medias.forEach(function(media) {
      var item = media;
      item.itemType = 'media';
      item.timestamp = parseInt(item.node.published, 10) * 1000;
      items.push(item);
    });

    items.sort(this.compare);
    this.setState({ items: items });
  }

  componentWillMount() {
    this.sort(this.props.annotations, this.props.medias);
  }

  componentWillReceiveProps(nextProps) {
    this.sort(nextProps.annotations, nextProps.medias);
  }

  render() {
    const that = this;
    const props = that.props;

    return (
      <div className='medias-and-annotations'>
        <ul className="medias-list annotations-list">
        
        {that.state.items.map(function(item) {

          if (item.itemType == 'annotation') {
            return (
              <li><Annotation annotation={item.node} annotated={props.annotated} annotatedType={props.annotatedType} /></li>
            );
          }

          else if (item.itemType == 'media') {
            return (
              <li className="media-card-link"><MediaCard media={item.node} /></li>
            );
          }

        })}

        </ul>

        <AddAnnotation annotated={props.annotated} annotatedType={props.annotatedType} types={props.types} />
      </div>
    );
  }
}

export default MediasAndAnnotations;
