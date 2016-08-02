import React, { Component, PropTypes } from 'react';
import Tabs from 'material-ui/lib/tabs/tabs';
import Tab from 'material-ui/lib/tabs/tab';
import { Annotations, SourceHeader, Tags } from './';

class SourceComponent extends Component {
  render() {
    const source = this.props.source;

    return (
      <div className="source" data-id={source.dbid} data-user-id={source.user_id}>
        <SourceHeader source={source} />

        <Tags tags={source.tags.edges} annotated={source} annotatedType="Source" />

        <Tabs className="tabs" initialSelectedIndex="1">
          <Tab label="All Activity"></Tab>
          <Tab label="Annotations"></Tab>
          <Tab label="Reports"></Tab>
          <Tab label="Credibility Reviews"></Tab>
        </Tabs>
            
        <Annotations annotations={source.annotations.edges} annotated={source} annotatedType="Source" />
      </div>
    );
  }
}

export default SourceComponent;
