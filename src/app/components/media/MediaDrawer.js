import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import AppBar from '@material-ui/core/AppBar';
import CloseIcon from '@material-ui/icons/Close';
import Container from '@material-ui/core/Container';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';

import MediaTimeline from './MediaTimeline';

export default function MediaDrawer({
  currentUser,
  duration,
  fragment,
  handleClose,
  media,
  open,
  playing,
  playerRect,
  progress,
  scrubTo,
  seekTo,
  setPlayerState,
  time,
}) {
  const [tab, setTab] = useState('timeline');

  return (
    <Drawer
      PaperProps={{
        style: {
          minHeight: '200px',
          top: playerRect ? playerRect.bottom + 8 : 'auto',
        },
      }}
      anchor="bottom"
      elevation="3"
      open={open}
      variant="persistent"
    >
      <AppBar elevation={1} position="sticky" color="inherit">
        <Toolbar variant="dense">
          <Grid alignItems="center" container justify="space-between">
            <Grid item>
              <Tabs value={tab}>
                <Tab
                  ariaControls=""
                  disabled
                  id="TimelineTab"
                  label={
                    <FormattedMessage
                      id="mediaDrawer.timelineTab"
                      defaultMessage="Timeline"
                    />
                  }
                  onClick={() => setTab('timeline')}
                  value="timeline"
                />
              </Tabs>
            </Grid>
            <Grid item>
              <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Container
        aria-labelledby="TimelineTab"
        hidden={tab !== 'timeline'}
        maxWidth="false"
        role="tabpanel"
      >
        <MediaTimeline
          setPlayerState={setPlayerState}
          {...{
            currentUser,
            duration,
            fragment,
            media,
            playing,
            progress,
            scrubTo,
            seekTo,
            time,
          }}
        />
      </Container>
    </Drawer>
  );
}

MediaDrawer.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  setPlayerState: PropTypes.func.isRequired,
};

MediaDrawer.defaultProps = {
  open: null,
};
