import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import SocialIcon from '../SocialIcon';

const useStyles = makeStyles({
  link: {
    textDecoration: 'none',
  },
});

const AccountChips = ({ accounts }) => {
  if (!accounts) return null;

  const classes = useStyles();

  return (
    <div className="account-chips">
      <ul className="account-chips__list">
        { accounts.map(account => (
          <Box component="span" mr={1} key={account.id}>
            <a className={classes.link} href={account.url} target="_blank" rel="noopener noreferrer">
              <Chip
                icon={<div><SocialIcon domain={account.provider} /></div>}
                onClick={() => {}}
                label={account.metadata.username || account.metadata.url}
              />
            </a>
          </Box>
        ))}
      </ul>
    </div>
  );
};

AccountChips.defaultProps = {
  accounts: null,
};

AccountChips.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    metadata: PropTypes.shape({
      username: PropTypes.string,
      url: PropTypes.string.isRequired,
    }),
  })),
};

export default AccountChips;
