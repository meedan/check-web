import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import TextArea from '../../cds/inputs/TextArea';
import TextField from '../../cds/inputs/TextField';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import settingsStyles from '../Settings.module.css';
import WhatsAppIcon from '../../../icons/whatsapp.svg';
import FacebookIcon from '../../../icons/facebook.svg';
import TwitterIcon from '../../../icons/twitter.svg';
import TelegramIcon from '../../../icons/telegram.svg';
import ViberIcon from '../../../icons/viber.svg';
import LineIcon from '../../../icons/line.svg';
import InstagramIcon from '../../../icons/instagram.svg';
import SettingsHeader from '../SettingsHeader';
import LanguagePickerSelect from '../../cds/inputs/LanguagePickerSelect';
import { withSetFlashMessage } from '../../FlashMessage';
import Can from '../../Can';

const TeamReportComponent = ({ team, setFlashMessage }) => {
  const defaultLanguage = team.get_language || 'en';
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const [reports, setReports] = React.useState(JSON.parse(JSON.stringify(team.get_report || {})));
  const [saving, setSaving] = React.useState(false);
  const [errorField, setErrorField] = React.useState(null);
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

  const isUrl = (string) => {
    try {
      return Boolean(new URL(string));
    } catch (e) {
      return false;
    }
  };

  const validateSignatureField = (field, value) => {
    const newReports = { ...reports };
    if (!isUrl(value)) {
      handleChange(field, value);
      setErrorField(null);
    } else {
      newReports[currentLanguage][field] = '';
      setErrorField(field);
    }
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

  if (!team.smooch_bot) {
    const path = `/${team.slug}/settings`;
    browserHistory.push(path);
    return null;
  }
  return (
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamReportComponent.title"
            defaultMessage="Reports"
            description="Header for the report settings page"
          />
        }
        context={
          <FormattedHTMLMessage
            id="teamReportComponent.helpContext"
            defaultMessage='Customize fact-check reports sent to tipline users. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about fact-check reports</a>.'
            values={{ helpLink: 'https://help.checkmedia.org/en/articles/8772805-fact-check-reports-guide' }}
            description="Context description for the functionality of this page"
          />
        }
        actionButton={
          <Can permissions={team.permissions} permission="update Team">
            <ButtonMain
              onClick={handleSave}
              theme="brand"
              size="default"
              variant="contained"
              disabled={saving}
              label={
                <FormattedMessage
                  id="teamReportComponent.save"
                  defaultMessage="Save"
                  description="Save settings button label"
                />
              }
              buttonProps={{
                id: 'team-report__save',
              }}
            />
          </Can>
        }
        extra={
          languages.length > 1 ?
            <LanguagePickerSelect
              selectedLanguage={currentLanguage}
              onSubmit={newValue => setCurrentLanguage(newValue.languageCode)}
              languages={languages}
            /> : null
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        <div className={cx(settingsStyles['setting-content-container'])}>
          <div className={settingsStyles['setting-content-container-title']}>
            <FormattedMessage
              id="teamReportComponent.introduction"
              defaultMessage="Introduction"
              description="Label to the report introduction field"
            />
          </div>
          <SwitchComponent
            checked={Boolean(report.use_introduction)}
            onChange={() => { handleChange('use_introduction', !report.use_introduction); }}
            label={
              <FormattedMessage
                id="teamReportComponent.introductionDescription"
                defaultMessage="Include an introduction anytime the report is sent to reference the initial query from the end user."
                description="Switch component descriptive text on the purpose of the report introduction"
              />
            }
            labelPlacement="end"
            inputProps={{
              id: 'use_introduction',
            }}
          />
          { report.use_introduction &&
            <div className={settingsStyles['setting-content-form-wrapper']}>
              <TextArea
                key={`introduction-${currentLanguage}`}
                value={report.introduction || ''}
                disabled={!report.use_introduction}
                onChange={(e) => { handleChange('introduction', e.target.value); }}
                helpContent={
                  <FormattedMessage
                    id="teamReportComponent.introductionSub"
                    defaultMessage="Use {query_date} placeholder to display the date of the original query. Use {status} to communicate the status of the article."
                    description="Instructions for filling the report introduction field"
                    values={{
                      query_date: '{{query_date}}',
                      status: '{{status}}',
                    }}
                  />
                }
                autoGrow
                rows="10"
                componentProps={{
                  id: 'introduction',
                }}
              />
            </div>
          }
        </div>
        <div className={cx(settingsStyles['setting-content-container'])}>
          <div className={settingsStyles['setting-content-container-title']}>
            <FormattedMessage
              id="teamReportComponent.url"
              defaultMessage="Website URL"
              description="Label to the report url field"
            />
          </div>
          <SwitchComponent
            checked={Boolean(report.use_url)}
            onChange={() => { handleChange('use_url', !report.use_url); }}
            label={
              <FormattedMessage
                id="teamReportComponent.urlDescription"
                defaultMessage="Include a link to a website anytime the report is sent to reference the initial query from the end user."
                description="Switch component descriptive text on the purpose of the report url"
              />
            }
            labelPlacement="end"
            inputProps={{
              id: 'use_url',
            }}
          />
          { report.use_url &&
            <div className={settingsStyles['setting-content-form-wrapper']}>
              <TextField
                key={`url-${currentLanguage}`}
                value={report.url || ''}
                disabled={!report.use_url}
                onChange={(e) => { handleChange('url', e.target.value); }}
                helpContent={
                  <FormattedMessage
                    id="teamReportComponent.urlLabel"
                    defaultMessage="Short URL ({max} characters max)"
                    description="Label for URL field in report settings"
                    values={{
                      max: 30,
                    }}
                  />
                }
                componentProps={{
                  type: 'url',
                  id: 'url',
                  maxLength: 30,
                }}
              />
            </div>
          }
        </div>
        <div className={cx(settingsStyles['setting-content-container'])}>
          <div className={settingsStyles['setting-content-container-title']}>
            <FormattedMessage
              id="teamReportComponent.signature"
              defaultMessage="Signature"
              description="Label to report signature field"
            />
          </div>
          <SwitchComponent
            checked={Boolean(report.use_signature)}
            onChange={() => { handleChange('use_signature', !report.use_signature); }}
            label={
              <FormattedMessage
                id="teamReportComponent.signatureDescription"
                defaultMessage="Include a custom signature anytime the report is sent to reference the initial query from the end user."
                description="Switch component descriptive text on the purpose of the report signature"
              />
            }
            labelPlacement="end"
            inputProps={{
              id: 'use_signature',
            }}
          />
          { report.use_signature &&
            <div className={settingsStyles['setting-content-form-wrapper']}>
              <TextField
                className={settingsStyles['setting-content-form-field']}
                key={`signature-${currentLanguage}`}
                value={report.signature || ''}
                disabled={!report.use_signature}
                onChange={(e) => { handleChange('signature', e.target.value); }}
                label={
                  <FormattedMessage
                    id="teamReportComponent.signatureLabel"
                    defaultMessage="Signature"
                    description="Label for signature field in report settings"
                    values={{
                      max: 30,
                    }}
                  />
                }
                helpContent={
                  <FormattedMessage
                    id="teamReportComponent.signatureHelp"
                    defaultMessage="{max} characters max"
                    description="Help content for signature field in report settings"
                    values={{
                      max: 30,
                    }}
                  />
                }
                componentProps={{
                  id: 'signature',
                  maxLength: 30,
                }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
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
                    description="Label to WhatsApp number field"
                  />
                }
                iconLeft={<WhatsAppIcon style={{ color: 'var(--whatsappGreen)' }} />}
                componentProps={{
                  id: 'whatsapp',
                }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                key={`facebook-${currentLanguage}`}
                value={report.facebook || ''}
                disabled={!report.use_signature}
                onChange={e => validateSignatureField('facebook', e.target.value)}
                error={errorField === 'facebook'}
                helpContent={errorField === 'facebook' ?
                  <FormattedMessage
                    id="teamReportComponent.facebookFieldError"
                    defaultMessage="Please use the page name instead of the full URL"
                    description="Error message displayed when facebook profile is filled incorrectly"
                  />
                  : null
                }
                label={
                  <FormattedMessage
                    id="teamReportComponent.facebook"
                    defaultMessage="Facebook page name"
                    description="Label to facebook page field"
                  />
                }
                iconLeft={<FacebookIcon style={{ color: 'var(--facebookBlue)' }} />}
                componentProps={{
                  id: 'facebook',
                }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                key={`twitter-${currentLanguage}`}
                value={report.twitter || ''}
                disabled={!report.use_signature}
                onChange={e => validateSignatureField('twitter', e.target.value)}
                error={errorField === 'twitter'}
                placeholder="@"
                helpContent={errorField === 'twitter' ?
                  <FormattedMessage
                    id="teamReportComponent.twitterFieldError"
                    defaultMessage="Please use the account name instead of the full URL"
                    description="Error message displayed when twitter profile is filled incorrectly"
                  />
                  : null
                }
                label={
                  <FormattedMessage
                    id="teamReportComponent.twitter"
                    defaultMessage="X (Twitter) account name"
                    description="Label to twitter username field"
                  />
                }
                iconLeft={<><TwitterIcon style={{ color: 'var(--xBlack)' }} /></>}
                componentProps={{
                  id: 'twitter',
                }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                key={`telegram-${currentLanguage}`}
                value={report.telegram || ''}
                disabled={!report.use_signature}
                onChange={e => validateSignatureField('telegram', e.target.value)}
                error={errorField === 'telegram'}
                helpContent={errorField === 'telegram' ?
                  <FormattedMessage
                    id="teamReportComponent.telegramFieldError"
                    defaultMessage="Please use the bot username instead of the full URL"
                    description="Error message displayed when telegram username is filled incorrectly"
                  />
                  : null
                }
                label={
                  <FormattedMessage
                    id="teamReportComponent.telegram"
                    defaultMessage="Telegram bot username"
                    description="Label to Telegram username field"
                  />
                }
                iconLeft={<TelegramIcon style={{ color: 'var(--telegramBlue)' }} />}
                componentProps={{
                  id: 'telegram',
                }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                key={`viber-${currentLanguage}`}
                value={report.viber || ''}
                disabled={!report.use_signature}
                onChange={(e) => { handleChange('viber', e.target.value); }}
                label={
                  <FormattedMessage
                    id="teamReportComponent.viber"
                    defaultMessage="Viber public account URI"
                    description="Label to Viber account field"
                  />
                }
                iconLeft={<ViberIcon style={{ color: 'var(--viberPurple)' }} />}
                componentProps={{
                  id: 'viber',
                }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                key={`line-${currentLanguage}`}
                value={report.line || ''}
                disabled={!report.use_signature}
                onChange={(e) => { handleChange('line', e.target.value); }}
                label={
                  <FormattedMessage
                    id="teamReportComponent.line"
                    defaultMessage="LINE channel"
                    description="Label to LINE channel field"
                  />
                }
                iconLeft={<LineIcon style={{ color: 'var(--lineGreen)' }} />}
                componentProps={{
                  id: 'line',
                }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                key={`instagram-${currentLanguage}`}
                value={report.instagram || ''}
                disabled={!report.use_signature}
                onChange={e => validateSignatureField('instagram', e.target.value)}
                label={
                  <FormattedMessage
                    id="teamReportComponent.instagram"
                    defaultMessage="Instagram username"
                    description="Label for Instagram username field"
                  />
                }
                iconLeft={<InstagramIcon style={{ color: 'var(--instagramPink)' }} />}
                componentProps={{
                  id: 'instagram',
                }}
              />
            </div>
          }
        </div>
      </div>
    </>
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
