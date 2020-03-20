import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import TagTextRoute from '../../relay/TagTextRoute';

class TagTextCountComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.relay.forceFetch();
  }

  render() {
    const { tag_text } = this.props;

    if (!tag_text) {
      return null;
    }

    return (
      <FormattedMessage
        id="tagTextCount.acknowledge"
        defaultMessage="{count, plural, =0 {Yes} one {I understand that by deleting this tag, it will be removed from one media item.} other {I understand that by deleting this tag, it will be removed from # media items.}}"
        values={{
          count: tag_text.tags_count || 0,
        }}
      />
    );
  }
}

const TagTextCountContainer = Relay.createContainer(TagTextCountComponent, {
  fragments: {
    tag_text: () => Relay.QL`
      fragment on TagText {
        tags_count
      }
    `,
  },
});

const TagTextCount = (props) => {
  if (props.tag) {
    const route = new TagTextRoute({ id: props.tag.dbid });
    return (
      <Relay.RootContainer
        Component={TagTextCountContainer}
        route={route}
        renderFetched={data => <TagTextCountContainer {...data} />}
      />
    );
  }

  return null;
};

export default TagTextCount;
