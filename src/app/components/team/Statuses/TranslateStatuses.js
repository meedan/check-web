/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { languageLabel } from '../../../LanguageRegistry';
import { units } from '../../../styles/js/shared';
import { FormattedGlobalMessage } from '../../MappedMessage';
import StatusLabel from './StatusLabel';
import StatusMessage from './StatusMessage';

const StyledTranslateStatusesContainer = styled.div`
  margin: ${units(4)};
`;

const StyledColHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledTextField = styled.div`
  margin-top: ${units(2)};
  margin-bottom: ${units(1)};
`;

const TranslateStatuses = ({
  statuses,
  defaultLanguage,
  currentLanguage,
  onSubmit,
}) => {
  const [translations, setTranslations] = React.useState({});
  const [messages, setMessages] = React.useState({});
  const [showWarning, setShowWarning] = React.useState(false);

  const handleDialogCancel = () => {
    setShowWarning(false);
  };

  const handleSubmit = () => {
    const newStatusesArray = statuses.map((s) => {
      const status = { ...s };
      const locales = { ...s.locales };

      let label = translations[s.id];
      let message = messages[s.id];

      if (typeof label === 'undefined' && s.locales[currentLanguage]) {
        label = s.locales[currentLanguage].label || '';
      }

      if (typeof message === 'undefined' && s.locales[currentLanguage]) {
        message = s.locales[currentLanguage].message || '';
      }

      locales[currentLanguage] = {
        label,
        message,
        description: '',
      };
      status.locales = locales;

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

    const missingMessage = statuses.some((s) => {
      const missedMessage =
        s.should_send_message &&
        s.locales[defaultLanguage] &&
        s.locales[defaultLanguage].message &&
        s.locales[defaultLanguage].message.length > 0 &&
        (!s.locales[currentLanguage] || !s.locales[currentLanguage].message || s.locales[currentLanguage].message.replace(/\s/g, '').length === 0);
      const newMessage = messages[s.id];
      return (missedMessage && !newMessage);
    });

    if (missingTranslation || missingMessage) {
      setShowWarning(true);
    } else {
      handleSubmit();
    }
  };

  const handleTextChange = (id, text) => {
    const newTranslations = { ...translations, [id]: text };
    setTranslations(newTranslations);
  };

  const handleMessageChange = (id, message) => {
    const newMessages = { ...messages, [id]: message };
    setMessages(newMessages);
  };

  return (
    <StyledTranslateStatusesContainer>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="button">
            { languageLabel(defaultLanguage) }
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <StyledColHeader>
            <Typography variant="button">
              { languageLabel(currentLanguage) }
            </Typography>
            <Button className="translate-statuses__save" variant="contained" color="primary" onClick={handleSave}>
              <FormattedGlobalMessage messageKey="save" />
            </Button>
          </StyledColHeader>
        </Grid>
      </Grid>
      {statuses.map(s => (
        <Box mt={1} key={s.id}>
          <Divider />
          <Grid
            spacing={2}
            container
            direction="row"
            alignItems="center"
          >
            <Grid item xs={6}>
              <Typography variant="caption" component="div">
                <FormattedMessage
                  id="translateStatuses.status"
                  defaultMessage="Status"
                />
              </Typography>
              <StatusLabel color={s.style.color}>
                { s.locales[defaultLanguage] ?
                  s.locales[defaultLanguage].label : s.label }
              </StatusLabel>
              <StatusMessage
                message={
                  s.locales[defaultLanguage] && s.should_send_message ?
                    s.locales[defaultLanguage].message : null
                }
              />
            </Grid>
            <Grid item xs={6}>
              <StyledTextField>
                <TextField
                  className="translate-statuses__input"
                  label={
                    <FormattedMessage
                      id="translateStatuses.status"
                      defaultMessage="Status"
                    />
                  }
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
              </StyledTextField>
              { s.should_send_message && s.locales[defaultLanguage] && s.locales[defaultLanguage].message ?
                <StyledTextField>
                  <TextField
                    className="translate-statuses__message"
                    label={
                      <FormattedMessage
                        id="translateStatuses.message"
                        defaultMessage="Message"
                      />
                    }
                    defaultValue={
                      s.locales[currentLanguage] ?
                        s.locales[currentLanguage].message : ''
                    }
                    fullWidth
                    id={`translate-statuses__message-${s.id}`}
                    multiline
                    rows={3}
                    rowsMax={Infinity}
                    onChange={e => (handleMessageChange(s.id, e.target.value))}
                    size="small"
                    variant="outlined"
                  />
                </StyledTextField> : null }
            </Grid>
          </Grid>
        </Box>
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
          <Box>
            <Typography variant="body1">
              <FormattedMessage
                id="translateStatuses.missingTranslationsBody"
                defaultMessage="Some statuses are missing translations. Users may not be able to read untranslated statuses."
              />
            </Typography>
            <p />
            <Typography variant="body1">
              <FormattedMessage
                id="translateStatuses.missingTranslationsBody2"
                defaultMessage="If the message for a status is not translated in a language, any requester using that language will not receive the message."
              />
            </Typography>
          </Box>
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
