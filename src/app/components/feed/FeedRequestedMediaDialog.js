import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedDate } from 'react-intl';
import {
  Box,
  Dialog,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import IconClose from '../../icons/clear.svg';
import { ImportButton } from './ImportDialog';
import RequestCards from './RequestCards';
import SmallMediaCard from '../cds/media-cards/SmallMediaCard';
import styles from '../../styles/css/dialog.module.css';

const useStyles = makeStyles({
  column: {
    width: '50%',
  },
  separator: {
    width: '16px',
  },
});

const FeedRequestedMediaDialog = ({
  open,
  media,
  request,
  onClose,
  onImport,
}) => {
  const classes = useStyles();

  return (
    <Dialog
      style={{ minHeight: '500px' }}
      className={styles['dialog-window']}
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <div className={styles['dialog-title']}>
        <FormattedMessage
          tagName="h6"
          id="feedRequestedMediaDialog.title"
          defaultMessage="Import medias and requests"
          description="Dialog title for importing medias and requests"
        />
        {onClose ? (
          <ButtonMain
            className={styles['dialog-close-button']}
            variant="text"
            size="small"
            theme="text"
            iconCenter={<IconClose />}
            onClick={onClose}
          />
        ) : null}
      </div>
      <div className={styles['dialog-content']}>
        <Box display="flex" justifyContent="space-between">
          <div className={classes.column}>
            <ImportButton onClick={onImport} />
            <SmallMediaCard
              customTitle={media.quote || `${request.request_type}-${request.feed.name.replace(' ', '-')}-${media.dbid}`}
              media={media}
              details={[
                (<FormattedMessage
                  id="feedRequestedMedia.lastSubmitted"
                  defaultMessage="Last submitted {date}"
                  description="Header of medias list. Example: 3 medias"
                  values={{
                    date: (
                      <FormattedDate
                        value={request.last_submitted_at * 1000}
                        year="numeric"
                        month="short"
                        day="2-digit"
                      />
                    ),
                  }}
                />),
              ]}
            />
          </div>
          <div className={classes.separator} />
          <div className={classes.column}>
            <RequestCards requestDbid={request.dbid} mediaDbid={media.dbid} />
          </div>
        </Box>
      </div>
    </Dialog>
  );
};

FeedRequestedMediaDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default createFragmentContainer(FeedRequestedMediaDialog, graphql`
  fragment FeedRequestedMediaDialog_media on Media {
    dbid
    ...SmallMediaCard_media
  }
`);
