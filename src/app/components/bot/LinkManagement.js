import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import TextField from '../cds/inputs/TextField';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import Alert from '../cds/alerts-and-prompts/Alert';
import LinkIcon from '../../icons/link.svg';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from './BotPreview.module.css';

const LinkManagement = ({
  isAdmin,
  onChangeEnableLinkShortening,
  onChangeUTMCode,
  shortenOutgoingUrls,
  team,
  utmCode,
}) => {
  const hasRssNewsletters = Boolean(team.tipline_newsletters.edges.find(tn => tn.node.content_type === 'rss'));
  const hasScheduledNewsletters = Boolean(team.tipline_newsletters.edges.find(tn => tn.node.enabled));

  return (
    <div className={styles['settings-card']}>
      <div className={styles['settings-card-header']}>
        <LinkIcon />
        <FormattedMessage defaultMessage="Link Management" description="Title of the link management section in team details page" id="linkManagement.linkManagementTitle" />
      </div>
      <div className={styles['setting-content-container']}>
        <SwitchComponent
          checked={shortenOutgoingUrls || hasRssNewsletters}
          className={inputStyles['form-fieldset-field']}
          disabled={hasRssNewsletters || hasScheduledNewsletters || !isAdmin}
          label={<FormattedMessage
            defaultMessage="Enable link shortening and engagement analytics"
            description="Label for a switch where the user toggles link management in team details page"
            id="linkManagement.linkManagementSwitcher"
          />}
          onChange={() => onChangeEnableLinkShortening(!shortenOutgoingUrls)}
        />
        <Alert
          content={
            <>
              <FormattedHTMLMessage
                defaultMessage="<strong>Link engagement analytics:</strong> Link shortening is used to record the number of times the link was clicked by users when distributed through a report or a newsletter."
                description="Helper text for link management switcher when workspace has RSS newsletters configured"
                id="linkManagement.linkManagementRss"
                tagName="div"
              />
              <br />
              <FormattedHTMLMessage
                defaultMessage='<strong>Link length and RSS:</strong> Link shortening makes URLs a predictable length. If you are using an RSS feed, the link service cannot be disabled. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about link shortening</a>.'
                description="Additional helper text for link management describing link length"
                id="linkManagement.linkManagementLinkLength"
                tagName="div"
                values={{ helpLink: 'https://help.checkmedia.org/en/articles/8772933-manage-links#h_99c0776acf' }}
              />
            </>
          }
        />
      </div>
      { shortenOutgoingUrls ?
        <div className={styles['setting-content-container']}>
          <div className={styles['settings-card-details']}>
            <FormattedHTMLMessage
              defaultMessage="<strong>UTM code </strong>"
              description="Label for 'UTM code' field"
              id="linkManagement.utmCode"
            />
            <FormattedMessage
              defaultMessage="Leave blank to disable UTM codes."
              description="Placeholder for the optional UTM code text field"
              id="linkManagement.utmCodePlaceholder"
            >
              { placeholder => (
                <TextField
                  className={inputStyles['form-fieldset-field']}
                  defaultValue={utmCode}
                  disabled={hasScheduledNewsletters || !isAdmin}
                  helpContent={
                    <FormattedHTMLMessage
                      defaultMessage='Customize the UTM code appended to the links. Leave blank to disable UTM codes. Use UTM codes to track article analytics. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about UTM codes</a>.'
                      description="Helper text for UTM code field"
                      id="linkManagement.utmCodeHelp"
                      values={{ helpLink: 'https://help.checkmedia.org/en/articles/8772933-manage-links#h_9bfd0e654f' }}
                    />
                  }
                  id="team-details__utm-code"
                  label={<FormattedMessage
                    defaultMessage="Append UTM code (optional)"
                    description="Title text for the UTM code input field"
                    id="linkManagement.utmCodeInputTitle"
                  />}
                  placeholder={placeholder}
                  onChange={e => onChangeUTMCode(e.target.value)}
                />
              )}
            </FormattedMessage>
            <Alert
              className={inputStyles['form-fieldset-field']}
              contained
              content={
                <FormattedHTMLMessage
                  defaultMessage="<strong>Before:</strong> https://www.example.com/your-link<br /><strong>After:</strong> https://chck.media/x1y2z3w4/{code}"
                  description="Text displayed in the content of a warning box on team details page when link shortening is on"
                  id="linkManagement.warnContent"
                  values={{ code: utmCode ? `?utm_source=${utmCode}` : '' }}
                />
              }
              title={<FormattedMessage defaultMessage="All links sent via Check will be rewritten." description="Text displayed in the title of a warning box on team details page when link shortening is on" id="linkManagement.warnTitle" />}
              variant="warning"
            />
          </div>
        </div>
        : null
      }
    </div>
  );
};

export default createFragmentContainer(LinkManagement, graphql`
  fragment LinkManagement_team on Team {
    tipline_newsletters(first: 10000) {
      edges {
        node {
          content_type
          enabled
        }
      }
    }
  }
`);
