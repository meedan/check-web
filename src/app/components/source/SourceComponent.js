import React, { Component, PropTypes } from 'react';
import Tabs from 'react-simpletabs';
import { Annotations, SourceHeader, Tags } from './';

class SourceComponent extends Component {
  render() {
    const source = this.props.source;

    return (
      <div className="source" data-id={source.dbid} data-user-id={source.user_id}>
        <SourceHeader source={source} />

        <Tags tags={source.tags.edges} annotated={source} annotatedType="Source" />

        <Tabs className="tabs">
          <Tabs.Panel title="Annotations">
            <Annotations annotations={source.annotations.edges} annotated={source} annotatedType="Source" />
          </Tabs.Panel>
          <Tabs.Panel title="Medias">
            <div>WIP</div>
          </Tabs.Panel>
        </Tabs>
      </div>
    );
  }
}

export default SourceComponent;
