import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { FormattedGlobalMessage } from '../MappedMessage';
import { stringHelper } from '../../customHelpers';
import { StyledCard, StyledSubHeader } from '../../styles/js/shared';

const useStyles = makeStyles({
  logo: {
    margin: '0 auto',
    display: 'block',
  },
});

const CheckStyledCard = ({
  title,
  body,
}) => {
  const classes = useStyles();

  return (
    <StyledCard>
      <FormattedGlobalMessage messageKey="appNameHuman">
        {appNameHuman => (
          <img
            className={classes.logo}
            alt={appNameHuman}
            width="120"
            src={stringHelper('LOGO_URL')}
          />
        )}
      </FormattedGlobalMessage>
      <Box my={3}>
        <StyledSubHeader>
          { title }
        </StyledSubHeader>
      </Box>
      { body }
    </StyledCard>
  );
};

CheckStyledCard.propTypes = {
  title: PropTypes.node.isRequired,
  body: PropTypes.node.isRequired,
};

export default CheckStyledCard;
