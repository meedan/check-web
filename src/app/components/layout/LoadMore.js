import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import InfiniteScroll from 'react-infinite-scroller';

class LoadMore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingMore: false,
    };
  }

  loadMore() {
    if (!this.state.loadingMore) {
      this.setState({ loadingMore: true }, () => {
        const newSize = this.props.currentSize + this.props.pageSize;
        this.props.relay.setVariables(
          { pageSize: newSize },
          (state) => {
            if (state.done || state.aborted) {
              this.setState({ loadingMore: false });
            }
          },
        );
      });
    }
  }

  render() {
    const hasMore = (this.props.currentSize < this.props.total);

    return (
      <div>
        <div
          style={{
            maxHeight: '500px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <InfiniteScroll hasMore={hasMore} loadMore={this.loadMore.bind(this)} useWindow={false}>
            {this.props.children}
          </InfiniteScroll>
        </div>
        { hasMore ?
          <Button
            onClick={this.loadMore.bind(this)}
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
  }
}

export default LoadMore;
