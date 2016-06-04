import React, { Component, PropTypes } from 'react';
import scriptjs from 'scriptjs';

class Embed extends Component {
  domain() {
    return this.props.url.split('/')[2];
  }

  componentDidMount() {
    if (this.domain() === 'twitter.com') {
      scriptjs('https://platform.twitter.com/widgets.js', function() {
        window.twttr.widgets.load();
      });
    }
    else {
      scriptjs('https://cdn.embedly.com/widgets/platform.js', function() {
        var element = document.getElementById('embedly');
        window.embedly('card', element);
      });
    }
  }

  render() {
    if (this.domain() === 'twitter.com') {
      return (<div className="embed"><blockquote className="twitter-tweet"><a id="embedly" href={this.props.url}></a></blockquote></div>);
    }
    else {
      return (<div className="embed"><a data-card-controls="0" data-card-width="100%" id="embedly" href={this.props.url}></a></div>);
    }
  }
}

export default Embed;
