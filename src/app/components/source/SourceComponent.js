import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Tabs from 'react-simpletabs';
import { Annotations, SourceHeader, Tags } from './';
import Medias from '../media/Medias';

const messages = defineMessages({
  annotationsTab: {
    id: 'sourceComponent.annotationsTab',
    defaultMessage: 'Annotations',
  },
  mediasTab: {
    id: 'sourceComponent.mediasTab',
    defaultMessage: 'Medias',
  },
});

class SourceComponent extends Component {
  render() {
    const source = this.props.source;

    return (
      <div className="source" data-id={source.dbid} data-user-id={source.user_id}>
        <SourceHeader source={source} />

        <Tags tags={source.tags.edges} annotated={source} annotatedType="Source" />

        <Tabs className="tabs">
          <Tabs.Panel title={this.props.intl.formatMessage(messages.annotationsTab)}>
            <Annotations annotations={source.annotations.edges} annotated={source} annotatedType="Source" />
          </Tabs.Panel>
          <Tabs.Panel title={this.props.intl.formatMessage(messages.mediasTab)}>
            <Medias medias={source.medias.edges} />
          </Tabs.Panel>
        </Tabs>
      </div>
    );
  }
}

SourceComponent.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SourceComponent);
