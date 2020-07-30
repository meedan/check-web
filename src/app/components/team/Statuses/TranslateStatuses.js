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
import { FormattedGlobalMessage } from '../../MappedMessage';
import { StatusLabel } from './StatusListItem';

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
  const [translations, setTranslations] = React.useState({});
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
    onSubmit(newStatusesArray);
  };

  const handleSave = () => {
    const missingTranslation = statuses.some((s) => {
      const savedTranslation =
        s.locales[currentLanguage] &&
        s.locales[currentLanguage].label;
      const newTranslation = translations[s.id];
      return (!savedTranslation && !newTranslation);
    });

    if (missingTranslation) {
      setShowWarning(missingTranslation);
    } else {
      handleSubmit();
    }
  };

  const handleTextChange = (id, text) => {
    const newTranslations = { ...translations, [id]: text };
    setTranslations(newTranslations);
  };

  return (
    <StyledTranslateStatusesContainer>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="button">
            { languagesList[defaultLanguage] ?
              languagesList[defaultLanguage].nativeName : defaultLanguage }
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <StyledColHeader>
            <Typography variant="button">
              { languagesList[currentLanguage] ?
                languagesList[currentLanguage].nativeName : currentLanguage }
            </Typography>
            <Button className="translate-statuses__save" variant="contained" color="primary" onClick={handleSave}>
              <FormattedGlobalMessage messageKey="save" />
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
            <StatusLabel color={s.style.color}>
              { s.locales[defaultLanguage] ?
                s.locales[defaultLanguage].label : s.label }
            </StatusLabel>
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
            defaultMessage="Some statuses are missing translations. Users may not be able to read untranslated statuses."
          />
        }
        onCancel={handleDialogCancel}
        onProceed={handleSubmit}
        proceedLabel={
          <FormattedMessage
            id="translateStatuses.continueAndSave"
            defaultMessage="Continue and save"
          />
        }
      />
    </StyledTranslateStatusesContainer>
  );
};

TranslateStatuses.propTypes = {
  statuses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  defaultLanguage: PropTypes.string.isRequired,
  currentLanguage: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TranslateStatuses;
