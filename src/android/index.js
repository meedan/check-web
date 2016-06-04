'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';
import ShareMenu from 'react-native-share-menu';
var styles = require('./stylesheet.js');

class Checkdesk extends Component {
  constructor(props) {
    super(props); 
    this.state = {
      url: null
    };
  }

  componentWillMount() {
    var that = this;
    ShareMenu.getSharedText((text :string) => {
      if (text && text.length) {
        that.setState({ url: text });
      }
    })
  }

  render() {
    var url = this.state.url;
    return (
      <View>
        <Text style={styles.h1}>Checkdesk</Text>
        <Text style={styles.text}>@Change to add your content here!</Text>
        <Text style={styles.text}>Current URL: {url}</Text>
      </View>
    );
  }
}

AppRegistry.registerComponent('Checkdesk', () => Checkdesk);
