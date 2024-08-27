/* eslint-disable react/sort-prop-types */
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
import settingsStyles from '../Settings.module.css';

const TeamReportComponent = ({ setFlashMessage, team }) => {
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
        defaultMessage="Could not save report settings"
        description="Warning displayed if an error occurred when saving report settings"
        id="teamReportComponent.defaultErrorMessage"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Report settings saved successfully"
        description="Banner displayed when report settings are saved successfully"
        id="teamReportComponent.savedSuccessfully"
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
        actionButton={
          <Can permission="update Team" permissions={team.permissions}>
            <ButtonMain
              buttonProps={{
                id: 'team-report__save',
              }}
              disabled={saving}
              label={
                <FormattedMessage
                  defaultMessage="Save"
                  description="Save settings button label"
                  id="teamReportComponent.save"
                />
              }
              size="default"
              theme="info"
              variant="contained"
              onClick={handleSave}
            />
          </Can>
        }
        context={
          <FormattedHTMLMessage
            defaultMessage='Customize fact-check reports sent to tipline users. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about fact-check reports</a>.'
            description="Context description for the functionality of this page"
            id="teamReportComponent.helpContext"
            values={{ helpLink: 'https://help.checkmedia.org/en/articles/8772805-fact-check-reports-guide' }}
          />
        }
        extra={
          languages.length > 1 ?
            <LanguagePickerSelect
              languages={languages}
              selectedLanguage={currentLanguage}
              onSubmit={newValue => setCurrentLanguage(newValue.languageCode)}
            /> : null
        }
        title={
          <FormattedMessage
            defaultMessage="Reports"
            description="Header for the report settings page"
            id="teamReportComponent.title"
          />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        <div className={cx(settingsStyles['setting-content-container'])}>
          <div className={settingsStyles['setting-content-container-title']}>
            <FormattedMessage
              defaultMessage="Introduction"
              description="Label to the report introduction field"
              id="teamReportComponent.introduction"
            />
          </div>
          <SwitchComponent
            checked={Boolean(report.use_introduction)}
            inputProps={{
              id: 'use_introduction',
            }}
            label={
              <FormattedMessage
                defaultMessage="Include an introduction anytime the report is sent to reference the initial query from the end user."
                description="Switch component descriptive text on the purpose of the report introduction"
                id="teamReportComponent.introductionDescription"
              />
            }
            labelPlacement="end"
            onChange={() => { handleChange('use_introduction', !report.use_introduction); }}
          />
          { report.use_introduction &&
            <div className={settingsStyles['setting-content-form-wrapper']}>
              <TextArea
                autoGrow
                componentProps={{
                  id: 'introduction',
                }}
                disabled={!report.use_introduction}
                helpContent={
                  <FormattedMessage
                    defaultMessage="Use {query_date} placeholder to display the date of the original query. Use {status} to communicate the status of the article."
                    description="Instructions for filling the report introduction field"
                    id="teamReportComponent.introductionSub"
                    values={{
                      query_date: '{{query_date}}',
                      status: '{{status}}',
                    }}
                  />
                }
                key={`introduction-${currentLanguage}`}
                rows="10"
                value={report.introduction || ''}
                onChange={(e) => { handleChange('introduction', e.target.value); }}
              />
            </div>
          }
        </div>
        <div className={cx(settingsStyles['setting-content-container'])}>
          <div className={settingsStyles['setting-content-container-title']}>
            <FormattedMessage
              defaultMessage="Website URL"
              description="Label to the report url field"
              id="teamReportComponent.url"
            />
          </div>
          <SwitchComponent
            checked={Boolean(report.use_url)}
            inputProps={{
              id: 'use_url',
            }}
            label={
              <FormattedMessage
                defaultMessage="Include a link to a website anytime the report is sent to reference the initial query from the end user."
                description="Switch component descriptive text on the purpose of the report url"
                id="teamReportComponent.urlDescription"
              />
            }
            labelPlacement="end"
            onChange={() => { handleChange('use_url', !report.use_url); }}
          />
          { report.use_url &&
            <div className={settingsStyles['setting-content-form-wrapper']}>
              <TextField
                componentProps={{
                  type: 'url',
                  id: 'url',
                  maxLength: 30,
                }}
                disabled={!report.use_url}
                helpContent={
                  <FormattedMessage
                    defaultMessage="Short URL ({max} characters max)"
                    description="Label for URL field in report settings"
                    id="teamReportComponent.urlLabel"
                    values={{
                      max: 30,
                    }}
                  />
                }
                key={`url-${currentLanguage}`}
                value={report.url || ''}
                onChange={(e) => { handleChange('url', e.target.value); }}
              />
            </div>
          }
        </div>
        <div className={cx(settingsStyles['setting-content-container'])}>
          <div className={settingsStyles['setting-content-container-title']}>
            <FormattedMessage
              defaultMessage="Signature"
              description="Label to report signature field"
              id="teamReportComponent.signature"
            />
          </div>
          <SwitchComponent
            checked={Boolean(report.use_signature)}
            inputProps={{
              id: 'use_signature',
            }}
            label={
              <FormattedMessage
                defaultMessage="Include a custom signature anytime the report is sent to reference the initial query from the end user."
                description="Switch component descriptive text on the purpose of the report signature"
                id="teamReportComponent.signatureDescription"
              />
            }
            labelPlacement="end"
            onChange={() => { handleChange('use_signature', !report.use_signature); }}
          />
          { report.use_signature &&
            <div className={settingsStyles['setting-content-form-wrapper']}>
              <TextField
                className={settingsStyles['setting-content-form-field']}
                componentProps={{
                  id: 'signature',
                  maxLength: 30,
                }}
                disabled={!report.use_signature}
                helpContent={
                  <FormattedMessage
                    defaultMessage="{max} characters max"
                    description="Help content for signature field in report settings"
                    id="teamReportComponent.signatureHelp"
                    values={{
                      max: 30,
                    }}
                  />
                }
                key={`signature-${currentLanguage}`}
                label={
                  <FormattedMessage
                    defaultMessage="Signature"
                    description="Label for signature field in report settings"
                    id="teamReportComponent.signatureLabel"
                    values={{
                      max: 30,
                    }}
                  />
                }
                value={report.signature || ''}
                onChange={(e) => { handleChange('signature', e.target.value); }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                componentProps={{
                  id: 'whatsapp',
                }}
                disabled={!report.use_signature}
                iconLeft={<WhatsAppIcon style={{ color: 'var(--whatsappGreen)' }} />}
                key={`whatsapp-${currentLanguage}`}
                label={
                  <FormattedMessage
                    defaultMessage="WhatsApp number"
                    description="Label to WhatsApp number field"
                    id="teamReportComponent.whatsapp"
                  />
                }
                value={report.whatsapp || ''}
                onChange={(e) => {
                  let { value } = e.target;
                  if (value) {
                    value = value.replace(/[^+0-9]/g, '');
                  }
                  handleChange('whatsapp', value);
                }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                componentProps={{
                  id: 'facebook',
                }}
                disabled={!report.use_signature}
                error={errorField === 'facebook'}
                helpContent={errorField === 'facebook' ?
                  <FormattedMessage
                    defaultMessage="Please use the page name instead of the full URL"
                    description="Error message displayed when facebook profile is filled incorrectly"
                    id="teamReportComponent.facebookFieldError"
                  />
                  : null
                }
                iconLeft={<FacebookIcon style={{ color: 'var(--facebookBlue)' }} />}
                key={`facebook-${currentLanguage}`}
                label={
                  <FormattedMessage
                    defaultMessage="Facebook page name"
                    description="Label to facebook page field"
                    id="teamReportComponent.facebook"
                  />
                }
                value={report.facebook || ''}
                onChange={e => validateSignatureField('facebook', e.target.value)}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                componentProps={{
                  id: 'twitter',
                }}
                disabled={!report.use_signature}
                error={errorField === 'twitter'}
                helpContent={errorField === 'twitter' ?
                  <FormattedMessage
                    defaultMessage="Please use the account name instead of the full URL"
                    description="Error message displayed when twitter profile is filled incorrectly"
                    id="teamReportComponent.twitterFieldError"
                  />
                  : null
                }
                iconLeft={<><TwitterIcon style={{ color: 'var(--xBlack)' }} /></>}
                key={`twitter-${currentLanguage}`}
                label={
                  <FormattedMessage
                    defaultMessage="X (Twitter) account name"
                    description="Label to twitter username field"
                    id="teamReportComponent.twitter"
                  />
                }
                placeholder="@"
                value={report.twitter || ''}
                onChange={e => validateSignatureField('twitter', e.target.value)}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                componentProps={{
                  id: 'telegram',
                }}
                disabled={!report.use_signature}
                error={errorField === 'telegram'}
                helpContent={errorField === 'telegram' ?
                  <FormattedMessage
                    defaultMessage="Please use the bot username instead of the full URL"
                    description="Error message displayed when telegram username is filled incorrectly"
                    id="teamReportComponent.telegramFieldError"
                  />
                  : null
                }
                iconLeft={<TelegramIcon style={{ color: 'var(--telegramBlue)' }} />}
                key={`telegram-${currentLanguage}`}
                label={
                  <FormattedMessage
                    defaultMessage="Telegram bot username"
                    description="Label to Telegram username field"
                    id="teamReportComponent.telegram"
                  />
                }
                value={report.telegram || ''}
                onChange={e => validateSignatureField('telegram', e.target.value)}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                componentProps={{
                  id: 'viber',
                }}
                disabled={!report.use_signature}
                iconLeft={<ViberIcon style={{ color: 'var(--viberPurple)' }} />}
                key={`viber-${currentLanguage}`}
                label={
                  <FormattedMessage
                    defaultMessage="Viber public account URI"
                    description="Label to Viber account field"
                    id="teamReportComponent.viber"
                  />
                }
                value={report.viber || ''}
                onChange={(e) => { handleChange('viber', e.target.value); }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                componentProps={{
                  id: 'line',
                }}
                disabled={!report.use_signature}
                iconLeft={<LineIcon style={{ color: 'var(--lineGreen)' }} />}
                key={`line-${currentLanguage}`}
                label={
                  <FormattedMessage
                    defaultMessage="LINE channel"
                    description="Label to LINE channel field"
                    id="teamReportComponent.line"
                  />
                }
                value={report.line || ''}
                onChange={(e) => { handleChange('line', e.target.value); }}
              />
              <TextField
                className={settingsStyles['setting-content-form-field']}
                componentProps={{
                  id: 'instagram',
                }}
                disabled={!report.use_signature}
                iconLeft={<InstagramIcon style={{ color: 'var(--instagramPink)' }} />}
                key={`instagram-${currentLanguage}`}
                label={
                  <FormattedMessage
                    defaultMessage="Instagram username"
                    description="Label for Instagram username field"
                    id="teamReportComponent.instagram"
                  />
                }
                value={report.instagram || ''}
                onChange={e => validateSignatureField('instagram', e.target.value)}
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
