import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import languagesList from '../../../languagesList';
import { units } from '../../../styles/js/shared';
import globalStrings from '../../../globalStrings';
import { StyledStatusLabel } from './StatusListItem';

const StyledTranslateStatusContainer = styled.div`
  margin: ${units(4)};
`;

const StyledColHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TranslateStatus = ({ statuses, defaultLanguage, currentLanguage }) => (
  <StyledTranslateStatusContainer>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Typography variant="button">
          {languagesList[defaultLanguage].nativeName}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <StyledColHeader>
          <Typography variant="button">
            {languagesList[currentLanguage].nativeName}
          </Typography>
          <Button variant="contained" color="primary">
            <FormattedMessage
              {...globalStrings.save}
            />
          </Button>
        </StyledColHeader>
      </Grid>
    </Grid>
    {statuses.map(s => (
      <Grid
        spacing={2}
        container
        direction="row"
        alignItems="center"
      >
        <Grid item xs={6}>
          <StyledStatusLabel color={s.style.color}>
            {s.label}
          </StyledStatusLabel>
        </Grid>
        <Grid item xs={6}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
          />
        </Grid>
      </Grid>
    ))}
  </StyledTranslateStatusContainer>
);

export default TranslateStatus;
