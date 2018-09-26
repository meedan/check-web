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
        id="tagTextCount.sentence"
        defaultMessage="{count, plural, =0 {Not being used by any media item.} one {It will be removed from one media item.} other {It will be removed from # media items.}}"
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
  const route = new TagTextRoute({ id: props.tag.dbid });
  return (
    <Relay.RootContainer
      Component={TagTextCountContainer}
      route={route}
      renderFetched={data => <TagTextCountContainer {...data} />}
    />
  );
};

export default TagTextCount;
