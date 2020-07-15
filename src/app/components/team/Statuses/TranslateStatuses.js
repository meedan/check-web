import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import languagesList from '../../../languagesList';
import { units } from '../../../styles/js/shared';
import globalStrings from '../../../globalStrings';
import { StyledStatusLabel } from './StatusListItem';

const StyledTranslateStatusesContainer = styled.div`
  margin: ${units(4)};
`;

const StyledColHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TranslateStatuses = ({
  statuses,
  defaultLanguage,
  currentLanguage,
  onSubmit,
}) => {
  const [translations, setStranslations] = React.useState({});
  const [showWarning, setShowWarning] = React.useState(false);

  const handleDialogCancel = () => {
    setShowWarning(false);
  };

  const handleSubmit = () => {
    const newStatusesArray = statuses.map((s) => {
      const status = { ...s };
      const locales = { ...s.locales };

      if (typeof translations[s.id] !== 'undefined') {
        locales[currentLanguage] = {
          label: translations[s.id],
          description: '',
        };
        status.locales = locales;
      }

      return status;
    });

    setShowWarning(false);

    if (onSubmit) {
      onSubmit(newStatusesArray);
    }
  };

  const handleSave = () => {
    let missingTranslation = false;

    statuses.forEach((s) => {
      const savedTranslation =
        s.locales[currentLanguage] &&
        s.locales[currentLanguage].label;
      const newTranslation = translations[s.id];
      if (!savedTranslation && !newTranslation) {
        missingTranslation = true;
      }
    });

    if (missingTranslation) {
      setShowWarning(missingTranslation);
    } else {
      handleSubmit();
    }
  };

  const handleTextChange = (id, text) => {
    const newTranslations = { ...translations };
    newTranslations[id] = text;
    setStranslations(newTranslations);
  };

  return (
    <StyledTranslateStatusesContainer>
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
            <Button className="translate-statuses__save" variant="contained" color="primary" onClick={handleSave}>
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
          key={s.id}
        >
          <Grid item xs={6}>
            <StyledStatusLabel color={s.style.color}>
              {s.label}
            </StyledStatusLabel>
          </Grid>
          <Grid item xs={6}>
            <TextField
              className="translate-statuses__input"
              defaultValue={
                s.locales[currentLanguage] ?
                  s.locales[currentLanguage].label : ''
              }
              fullWidth
              id={`translate-statuses__input-${s.id}`}
              onChange={e => (handleTextChange(s.id, e.target.value))}
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
      ))}
      <ConfirmProceedDialog
        open={showWarning}
        title={
          <FormattedMessage
            id="translateStatuses.missingTranslations"
            defaultMessage="Missing translations"
          />
        }
        body={
          <FormattedMessage
            id="translateStatuses.missingTranslationsBody"
            defaultMessage="Some statuses are missing translation. If they need to be used in this language, they will be replaced by the same value in the default language, and may not be legible to users."
          />
        }
        onCancel={handleDialogCancel}
        onProceed={handleSubmit}
      />
    </StyledTranslateStatusesContainer>
  );
};

TranslateStatuses.propTypes = {
  statuses: PropTypes.array.isRequired,
  defaultLanguage: PropTypes.string.isRequired,
  currentLanguage: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TranslateStatuses;
