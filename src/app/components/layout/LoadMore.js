import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from 'material-ui-next/Button';

const LoadMore = props => (
  <div>
    {props.children}
    { props.hasMore ?
      <Button
        onClick={props.loadMore}
        fullWidth
        color="primary"
        size="large"
      >
        <FormattedMessage
          id="loadMore.loadMore"
          defaultMessage="Load more"
        />
      </Button> : null
    }
  </div>
);

export default LoadMore;
