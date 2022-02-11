/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import InputAdornment from '@material-ui/core/InputAdornment';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import TelegramIcon from '@material-ui/icons/Telegram';
import ViberIcon from '../../../icons/ViberIcon';
import LineIcon from '../../../icons/LineIcon';

import SettingsHeader from '../SettingsHeader';
import LanguageSwitcher from '../../LanguageSwitcher';
import { withSetFlashMessage } from '../../FlashMessage';
import Can from '../../Can';
import {
  ContentColumn,
  whatsappGreen,
  facebookBlue,
  twitterBlue,
  telegramBlue,
  viberPurple,
  lineGreen,
} from '../../../styles/js/shared';

const TeamReportComponent = ({ team, setFlashMessage }) => {
  const defaultLanguage = team.get_language || 'en';
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const [reports, setReports] = React.useState(JSON.parse(JSON.stringify(team.get_report || {})));
  const [saving, setSaving] = React.useState(false);
  const report = reports[currentLanguage] || {};
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];

  const handleChange = (field, value) => {
    const newReports = { ...reports };
    newReports[currentLanguage] = reports[currentLanguage] || {};
    newReports[currentLanguage][field] = value;
    setReports(newReports);
  };

  const handleError = () => {
    setSaving(false);
    // FIXME: Get error message from backend
    setFlashMessage((
      <FormattedMessage
        id="teamReportComponent.defaultErrorMessage"
        defaultMessage="Could not save report settings"
        description="Warning displayed if an error occurred when saving report settings"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="teamReportComponent.savedSuccessfully"
        defaultMessage="Report settings saved successfully"
        description="Banner displayed when report settings are saved successfully"
      />
    ), 'success');
  };

  const handleSave = () => {
    setSaving(true);

    const mutation = graphql`
      mutation TeamReportComponentUpdateTeamMutation($input: UpdateTeamInput!) {
        updateTeam(input: $input) {
          team {
            get_report
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id: team.id,
          report: JSON.stringify(reports),
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess();
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  return (
    <Box display="flex" justifyContent="left" className="team-report-component">
      <LanguageSwitcher
        orientation="vertical"
        primaryLanguage={defaultLanguage}
        currentLanguage={currentLanguage}
        languages={languages}
        onChange={setCurrentLanguage}
      />
      <ContentColumn large>
        <SettingsHeader
          title={
            <FormattedMessage
              id="teamReportComponent.title"
              defaultMessage="Default report settings"
            />
          }
          subtitle={
            <FormattedMessage
              id="teamReportComponent.subtitle"
              defaultMessage="The content you set here can be edited in each individual report."
            />
          }
          helpUrl="http://help.checkmedia.org/en/articles/3627266-check-message-report"
          actionButton={
            <Can permissions={team.permissions} permission="update Team">
              <Button onClick={handleSave} color="primary" variant="contained" id="team-report__save" disabled={saving}>
                <FormattedMessage id="teamReportComponent.save" defaultMessage="Save" />
              </Button>
            </Can>
          }
        />
        <Card>
          <CardContent>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    id="use_introduction"
                    key={`use-introduction-${currentLanguage}`}
                    checked={report.use_introduction || false}
                    onChange={(e) => { handleChange('use_introduction', e.target.checked); }}
                  />
                }
                label={
                  <FormattedMessage id="teamReportComponent.introduction" defaultMessage="Introduction" />
                }
              />
              <TextField
                id="introduction"
                key={`introduction-${currentLanguage}`}
                value={report.introduction || ''}
                disabled={!report.use_introduction}
                onChange={(e) => { handleChange('introduction', e.target.value); }}
                helperText={
                  <FormattedMessage
                    id="teamReportComponent.introductionSub"
                    defaultMessage="Use {query_date} placeholder to display the date of the original query. Use {status} to communicate the status of the article."
                    values={{
                      query_date: '{{query_date}}',
                      status: '{{status}}',
                    }}
                  />
                }
                variant="outlined"
                rows="10"
                rowsMax={Infinity}
                multiline
                fullWidth
              />
            </Box>

            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="use_url"
                    key={`use-url-${currentLanguage}`}
                    checked={report.use_url || false}
                    onChange={(e) => { handleChange('use_url', e.target.checked); }}
                  />
                }
                label={
                  <FormattedMessage id="teamReportComponent.url" defaultMessage="Website URL" />
                }
              />
              <Box width={0.5}>
                <TextField
                  id="url"
                  type="url"
                  key={`url-${currentLanguage}`}
                  value={report.url || ''}
                  disabled={!report.use_url}
                  onChange={(e) => { handleChange('url', e.target.value); }}
                  inputProps={{ maxLength: 30 }}
                  label={
                    <FormattedMessage
                      id="teamReportComponent.urlLabel"
                      defaultMessage="Short URL ({max} characters max)"
                      description="Label for URL field in report settings"
                      values={{
                        max: 30,
                      }}
                    />
                  }
                  variant="outlined"
                  fullWidth
                />
              </Box>
            </Box>

            <Box mt={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="use_signature"
                    key={`use-signature-${currentLanguage}`}
                    checked={report.use_signature || false}
                    onChange={(e) => { handleChange('use_signature', e.target.checked); }}
                  />
                }
                label={
                  <FormattedMessage id="teamReportComponent.signature" defaultMessage="Signature" />
                }
              />
              <Box width={0.5} mt={1} mb={2}>
                <TextField
                  id="signature"
                  type="url"
                  key={`signature-${currentLanguage}`}
                  value={report.signature || ''}
                  disabled={!report.use_signature}
                  onChange={(e) => { handleChange('signature', e.target.value); }}
                  inputProps={{ maxLength: 30 }}
                  label={
                    <FormattedMessage
                      id="teamReportComponent.signatureLabel"
                      defaultMessage="Signature ({max} characters max)"
                      description="Label for signature field in report settings"
                      values={{
                        max: 30,
                      }}
                    />
                  }
                  variant="outlined"
                  fullWidth
                />
              </Box>
              <Box width={0.5} mt={1} mb={2}>
                <TextField
                  id="whatsapp"
                  key={`whatsapp-${currentLanguage}`}
                  value={report.whatsapp || ''}
                  disabled={!report.use_signature}
                  onChange={(e) => {
                    let { value } = e.target;
                    if (value) {
                      value = value.replace(/[^+0-9]/g, '');
                    }
                    handleChange('whatsapp', value);
                  }}
                  label={
                    <FormattedMessage
                      id="teamReportComponent.whatsapp"
                      defaultMessage="WhatsApp number"
                    />
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WhatsAppIcon style={{ color: whatsappGreen }} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  fullWidth
                />
              </Box>
              <Box width={0.5} mt={1} mb={2}>
                <TextField
                  id="facebook"
                  key={`facebook-${currentLanguage}`}
                  value={report.facebook || ''}
                  disabled={!report.use_signature}
                  onChange={(e) => { handleChange('facebook', e.target.value); }}
                  label={
                    <FormattedMessage
                      id="teamReportComponent.facebook"
                      defaultMessage="Facebook page name"
                    />
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FacebookIcon style={{ color: facebookBlue }} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  fullWidth
                />
              </Box>
              <Box width={0.5} mt={1} mb={2}>
                <TextField
                  id="twitter"
                  key={`twitter-${currentLanguage}`}
                  value={report.twitter || ''}
                  disabled={!report.use_signature}
                  onChange={(e) => { handleChange('twitter', e.target.value); }}
                  label={
                    <FormattedMessage
                      id="teamReportComponent.twitter"
                      defaultMessage="Twitter account name"
                    />
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TwitterIcon style={{ color: twitterBlue }} />
                        {' @ '}
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  fullWidth
                />
              </Box>
              <Box width={0.5} mt={1} mb={2}>
                <TextField
                  id="telegram"
                  key={`telegram-${currentLanguage}`}
                  value={report.telegram || ''}
                  disabled={!report.use_signature}
                  onChange={(e) => { handleChange('telegram', e.target.value); }}
                  label={
                    <FormattedMessage
                      id="teamReportComponent.telegram"
                      defaultMessage="Telegram bot username"
                    />
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TelegramIcon style={{ color: telegramBlue }} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  fullWidth
                />
              </Box>
              <Box width={0.5} mt={1} mb={2}>
                <TextField
                  id="viber"
                  key={`viber-${currentLanguage}`}
                  value={report.viber || ''}
                  disabled={!report.use_signature}
                  onChange={(e) => { handleChange('viber', e.target.value); }}
                  label={
                    <FormattedMessage
                      id="teamReportComponent.viber"
                      defaultMessage="Viber public account URI"
                    />
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ViberIcon style={{ color: viberPurple }} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  fullWidth
                />
              </Box>
              <Box width={0.5} mt={1} mb={2}>
                <TextField
                  id="line"
                  key={`line-${currentLanguage}`}
                  value={report.line || ''}
                  disabled={!report.use_signature}
                  onChange={(e) => { handleChange('line', e.target.value); }}
                  label={
                    <FormattedMessage
                      id="teamReportComponent.line"
                      defaultMessage="LINE channel"
                    />
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LineIcon style={{ color: lineGreen }} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  fullWidth
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </ContentColumn>
    </Box>
  );
};

TeamReportComponent.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
    get_language: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
    get_report: PropTypes.string.isRequired,
  }).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(TeamReportComponent);
