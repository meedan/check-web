import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, FormattedHTMLMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { stripUnit } from 'polished';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { Link } from 'react-router';
import { withSetFlashMessage } from '../FlashMessage';
import { FormattedGlobalMessage } from '../MappedMessage';
import ParsedText from '../ParsedText';
import TimeBefore from '../TimeBefore';
import ProfileLink from '../layout/ProfileLink';
import DatetimeTaskResponse from '../task/DatetimeTaskResponse';
import { languageLabel } from '../../LanguageRegistry';
import {
  getErrorMessage,
  getStatus,
  getStatusStyle,
  emojify,
  parseStringUnixTimestamp,
  safelyParseJSON,
} from '../../helpers';
import { stringHelper } from '../../customHelpers';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import { units } from '../../styles/js/shared';

const dotOffset = stripUnit(units(4)) - stripUnit(3);

const StyledDefaultAnnotation = styled.div`
  color: var(--textPrimary);
  display: flex;
  width: 100%;
  ${props => (props.theme.dir === 'rtl' ? 'padding-right' : 'padding-left')}: ${units(10)};

  .annotation__default-content {
    width: 100%;
    hyphens: auto;
    overflow-wrap: break-word;
    word-break: break-word;
    display: block;
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(2)};
  }
`;

const StyledAnnotationWrapper = styled.section`
  position: relative;
  display: flex;
  padding: ${units(1)} 0;
  position: relative;

  &:not(.annotation--card) {
    // The timeline dot
    &::before {
      background-color: var(--grayBorderMain);
      border-radius: 100%;
      content: '';
      height: ${units(1)};
      outline: 3px solid var(--otherWhite);
      position: absolute;
      top: ${units(2)};
      width: ${units(1)};
      ${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: ${dotOffset}px;
    }
  }

  .annotation__card-text {
    display: flex;
    padding: ${units(3)} ${units(2)} ${units(1)} !important;
  }

  .annotation__card-activity-move-to-trash {
    background: var(--brandMain);
    color: var(--otherWhite);
    border-radius: 2px;

    .annotation__timestamp {
      color: var(--otherWhite);
    }
  }

  .annotation__timestamp {
    color: var(--textDisabled);
    display: inline;
    flex: 1;
    white-space: pre;
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(1)};
  }

  .annotation__actions {
    align-self: flex-start;
    display: none;
    flex: 1;
    text-align: ${props => (props.theme.dir === 'rtl' ? 'left' : 'right')};
  }

  .annotation__body {
    hyphens: auto;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .annotation__embedded-media {
    padding-bottom: ${units(1)};
    padding-top: ${units(1)};
  }

  .annotation__tag {
    &::before {
      content: '#';
    }
  }

  .annotation__update-task > span {
    display: block;
  }

  .annotation__card-embedded-medias {
    clear: both;
    margin-top: ${units(0.5)};
  }

  .annotation__keep a {
    text-decoration: underline;
  }
`;

const messages = defineMessages({
  editedBy: {
    id: 'annotation.editedBy',
    defaultMessage: 'edited by',
    description: 'Fact-check in edited state',
  },
  pausedBy: {
    id: 'annotation.pausedBy',
    defaultMessage: 'paused by',
    description: 'Fact-check in paused state',
  },
  publishedBy: {
    id: 'annotation.publishedBy',
    defaultMessage: 'published by',
    description: 'Fact-check in published state',
  },
});

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class Annotation extends Component {
  fail = (transaction) => {
    const message = getErrorMessage(
      transaction,
      (
        <FormattedGlobalMessage
          messageKey="unknownError"
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      ),
    );
    this.props.setFlashMessage(message, 'error');
  };

  static renderTaskResponse(type, object) {
    if (type === 'multiple_choice') {
      const response = JSON.parse(object.value);
      const selected = response.selected || [];
      if (response.other) {
        selected.push(response.other);
      }
      return <ul>{selected.map(s => <li><ParsedText text={s} /></li>)}</ul>;
    } else if (type === 'geolocation') {
      const geojson = JSON.parse(object.value);
      const { geometry: { coordinates }, properties: { name } } = geojson;
      if (!coordinates[0] || !coordinates[1]) {
        return (
          <a
            style={{ textDecoration: 'underline' }}
            href={`http://www.openstreetmap.org/?mlat=${coordinates[0]}&mlon=${coordinates[1]}&zoom=12#map=12/${coordinates[0]}/${coordinates[1]}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <ParsedText text={name} block />
          </a>
        );
      }
      return <ParsedText text={name} block />;
    } else if (type === 'datetime') {
      return <DatetimeTaskResponse response={object.value} />;
    }
    return <ParsedText text={object.value} block />;
  }

  render() {
    const { annotation: activity, annotation: { annotation } } = this.props;
    const updatedAt = parseStringUnixTimestamp(activity.created_at);
    const timestamp = updatedAt
      ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span>
      : null;
    const authorName = activity.user
      ? <ProfileLink className="annotation__author-name" user={activity.user} /> : null;
    const object = JSON.parse(activity.object_after);
    const content = object.data;
    let activityType = activity.event_type;
    let contentTemplate = null;

    switch (activityType) {
    case 'create_tag':
      if (activity.tag && activity.tag.tag_text) {
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.taggedHeader"
              defaultMessage="Tag #{tag} added by {author}"
              description="Log entry indicating a tag was added"
              values={{
                tag: activity.tag.tag_text.replace(/^#/, ''),
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    case 'create_task':
      if (content.fieldset === 'metadata') {
        contentTemplate = (
          <span className="annotation__metadata-created">
            <FormattedMessage
              id="annotation.metadataCreated"
              defaultMessage="Annotation field created by {author}: {fieldLabel}"
              description="Log entry indicating an annotation field was created"
              values={{
                fieldLabel: content.label,
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    case 'create_relationship':
    case 'update_relationship': {
      const meta = safelyParseJSON(activity.meta);
      if (meta && meta.source) {
        const { source } = meta;
        const relationshipAuthor = source.by_check ? 'Check' : authorName;
        const type = object.relationship_type;
        contentTemplate = (
          <span>
            { /confirmed_sibling/.test(type) ?
              <FormattedMessage
                id="annotation.similarCreated"
                defaultMessage="Match confirmed by {author}: {title}"
                description="Log entry indicating a similarity match was confirmed"
                values={{
                  title: (<Link to={source.url} target="_blank">{emojify(source.title)}</Link>),
                  author: relationshipAuthor,
                }}
              /> : null }
            { /suggested/.test(type) ?
              <FormattedMessage
                id="annotation.suggestionCreated"
                defaultMessage="Match suggested by {author}: {title}"
                description="Log entry indicating a similarity match was suggested"
                values={{
                  title: (<Link to={source.url} target="_blank">{emojify(source.title)}</Link>),
                  author: relationshipAuthor,
                }}
              /> : null }
          </span>
        );
      }
      break;
    }
    case 'destroy_relationship': {
      const meta = safelyParseJSON(activity.meta);
      if (meta && meta.source) {
        const { source } = meta;
        const relationshipAuthor = source.by_check ? 'Check' : authorName;
        const relationshipChanges = safelyParseJSON(activity.object_changes_json);
        const type = relationshipChanges.relationship_type[0];
        contentTemplate = (
          <span>
            { /confirmed_sibling/.test(type) ?
              <FormattedMessage
                id="annotation.similarDestroyed"
                defaultMessage="Match deleted by {author}: {title}"
                description="Tells that one item previously confirmed as similar has been detached from current item."
                values={{
                  title: (<Link to={source.url} target="_blank">{emojify(source.title)}</Link>),
                  author: relationshipAuthor,
                }}
              /> : null }
            { /suggested_sibling/.test(type) ?
              <FormattedMessage
                id="annotation.suggestionDestroyed"
                defaultMessage="Match rejected by {author}: {title}"
                description="Log entry indicating a similarity match was rejected"
                values={{
                  title: (<Link to={source.url} target="_blank">{emojify(source.title)}</Link>),
                  author: relationshipAuthor,
                }}
              /> : null }
          </span>
        );
      }
      break;
    }
    case 'create_assignment': {
      const meta = safelyParseJSON(activity.meta);
      if (meta) {
        const { type, title, user_name } = meta;
        const values = {
          title,
          name: user_name,
          author: authorName,
        };
        if (type === 'task') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.taskAssignmentCreated"
                defaultMessage="Task assigned to {name} by {author}: {title}"
                description="Log entry indicating a task has been assigned"
                values={values}
              />
            </span>
          );
        }
        if (type === 'media') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.mediaAssignmentCreated"
                defaultMessage="Item assigned to {name} by {author}"
                description="Log entry indicating an item has been assigned"
                values={values}
              />
            </span>
          );
        }
      }
      break;
    }
    case 'destroy_assignment': {
      const meta = safelyParseJSON(activity.meta);
      if (meta) {
        const { type, title, user_name } = meta;
        const values = {
          title,
          name: user_name,
          author: authorName,
        };
        if (type === 'task') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.taskAssignmentDeleted"
                defaultMessage="Task unassigned from {name} by {author}: {title}"
                description="Log entry indicating a task has been unassigned"
                values={values}
              />
            </span>
          );
        }
        if (type === 'media') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.mediaAssignmentDeleted"
                defaultMessage="Item unassigned from {name} by {author}"
                description="Log entry indicating an item has been unassigned"
                values={values}
              />
            </span>
          );
        }
      }
      break;
    }
    case 'create_dynamic':
    case 'update_dynamic':
      if (object.annotation_type === 'verification_status') {
        const statusChanges = safelyParseJSON(activity.object_changes_json);
        if (statusChanges.locked) {
          if (statusChanges.locked[1]) {
            contentTemplate = (
              <FormattedMessage
                id="annotation.statusLocked"
                defaultMessage="Item status locked by {author}"
                description="Log entry indicating an item status has been locked"
                values={{ author: authorName }}
              />
            );
          } else {
            contentTemplate = (
              <FormattedMessage
                id="annotation.statusUnlocked"
                defaultMessage="Item status unlocked by {author}"
                description="Log entry indicating an item status has been unlocked"
                values={{ author: authorName }}
              />
            );
          }
        } else if (statusChanges.assigned_to_id) {
          const assignment = safelyParseJSON(activity.meta);
          if (assignment.assigned_to_name) {
            contentTemplate = (
              <FormattedMessage
                id="annotation.mediaAssigned"
                defaultMessage="Item assigned to {name} by {author}"
                description="Log entry indicating an item has been assigned"
                values={{
                  name: assignment.assigned_to_name,
                  author: authorName,
                }}
              />
            );
          } else {
            contentTemplate = (
              <FormattedMessage
                id="annotation.mediaUnassigned"
                defaultMessage="Item unassigned from {name} by {author}"
                description="Log entry indicating an item has been unassigned"
                values={{
                  name: assignment.assigned_from_name,
                  author: authorName,
                }}
              />
            );
          }
        }
      } else if (object.annotation_type === 'report_design') {
        const reportDesignChange = safelyParseJSON(activity.object_changes_json).data;
        let reportState = this.props.intl.formatMessage(messages.editedBy);
        if (reportDesignChange && reportDesignChange[0]) {
          reportState = reportDesignChange[1].state;
          if (reportDesignChange[0].state === reportDesignChange[1].state) {
            reportState = this.props.intl.formatMessage(messages.editedBy);
          } else if (reportDesignChange[1].state === 'published') {
            reportState = this.props.intl.formatMessage(messages.publishedBy);
          } else {
            reportState = this.props.intl.formatMessage(messages.pausedBy);
          }
        }
        contentTemplate = (
          <FormattedMessage
            id="annotation.reportDesignState"
            defaultMessage="Fact-check report {state} {author}"
            description="Log entry indicating a report state has changed. Example: Fact-check report [edited by|paused by|published by] author"
            values={{
              state: reportState,
              author: authorName,
            }}
          />
        );
      }
      break;
    case 'create_dynamicannotationfield':
    case 'update_dynamicannotationfield':
    {
      if (object.field_name === 'verification_status_status' && config.appName === 'check' && activityType === 'update_dynamicannotationfield') {
        const statusValue = object.value;
        const statusCode = statusValue.toLowerCase().replace(/[ _]/g, '-');
        const status = getStatus(this.props.team.verification_statuses, statusValue);
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.statusSetHeader"
              defaultMessage="Status changed to {status} by {author}"
              description="Log entry indicating an item status has been changed"
              values={{
                status: (
                  <span
                    className={`typography-caption annotation__status annotation__status--${statusCode}`}
                    style={{ color: getStatusStyle(status, 'color') }}
                  >
                    {status.label}
                  </span>
                ),
                author: authorName,
              }}
            />
          </span>
        );
      }

      if (object.field_name === 'team_bot_response_formatted_data') {
        activityType = 'bot_response';
        const botResponse = JSON.parse(object.value);
        contentTemplate = (
          <div>
            <div className="annotation__card-content annotation__bot-response">
              <span>
                <strong>{botResponse.title}</strong><br />
                <ParsedText text={botResponse.description} />
              </span>
              <div>
                { botResponse.image_url ?
                  <div
                    style={{
                      background: `transparent url('${botResponse.image_url}') top left no-repeat`,
                      backgroundSize: 'cover',
                      border: '1px solid var(--grayBorderMain)',
                      width: 80,
                      height: 80,
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                    className="annotation__card-thumbnail annotation__bot-response-thumbnail"
                    onClick={this.handleOpenCommentImage.bind(this, botResponse.image_url)}
                  /> : null }
              </div>
            </div>
          </div>
        );
      }

      if (object.field_name === 'language') {
        const languageName = object.value !== 'und' ? languageLabel(object.value) : (
          <FormattedMessage
            id="annotation.unknownLanguage"
            defaultMessage="Unknown language"
            description="Show label for undefined language"
          />
        );
        contentTemplate = activityType === 'create_dynamicannotationfield' ? (
          <span>
            <FormattedMessage
              id="annotation.addLanguage"
              defaultMessage="Language {value} added by {author}"
              description="Log entry indicating an item language has been set. {value} receives language name"
              values={{
                value: languageName,
                author: 'Check',
              }}
            />
          </span>
        ) : (
          <span>
            <FormattedMessage
              id="annotation.updateLanguage"
              defaultMessage="Language {value} updated by {author}"
              description="Log entry indicating an item language has been updated. {value} receives language name"
              values={{
                value: languageName,
                author: authorName,
              }}
            />
          </span>
        );
      }

      if (/^response_/.test(object.field_name) && activity.task) {
        if (activity.task.fieldset === 'metadata') {
          contentTemplate = (
            <span className="annotation__metadata-filled">
              <FormattedMessage
                id="annotation.metadataResponse"
                defaultMessage='Annotation "{fieldLabel}" edited by {author}: {response}'
                description="Log entry indicating an annotation response has been changed"
                values={{
                  fieldLabel: activity.task.label,
                  author: authorName,
                  response: Annotation.renderTaskResponse(activity.task.type, object),
                }}
              />
            </span>
          );
        }
      }

      // TODO Replace with Pender-supplied names.
      const archivers = {
        archive_org_response: 'Archive.org',
        perma_cc_response: 'Perma.cc',
        video_archiver_response: 'Video Archiver',
      };
      if (object.annotation_type === 'archiver' && activityType === 'create_dynamicannotationfield') {
        const archiveContent = JSON.parse(annotation.content);
        const archive = archiveContent.filter(item => item.field_name === object.field_name);
        const archiveResponse = JSON.parse(archive[0].value);
        const archiveLink = archiveResponse.location;
        const archiveStatus = parseInt(archiveResponse.status, 10);
        const archiveName = archivers[object.field_name];
        contentTemplate = null;
        if (!(archiveLink || archiveResponse.error || archiveStatus >= 400)) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverWait"
                defaultMessage="This item is being archived at {name}. The archive link will be displayed here when it's ready."
                values={{ name: archiveName }}
              />
            </span>
          );
        }
      }
      break;
    }
    case 'create_projectmedia': {
      const meta = safelyParseJSON(activity.meta);
      if (meta && meta.add_source) {
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.addSource"
              defaultMessage="Source {name} add by {author}"
              description="Log entry indicating a source has been added"
              values={{
                name: meta.source_name,
                author: 'Check',
              }}
            />
          </span>
        );
      } else {
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.createProjectMedia"
              defaultMessage="Item created by {author}"
              description="Log entry indicating an item has been created"
              values={{
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    }
    case 'update_projectmedia': {
      const itemChanges = safelyParseJSON(activity.object_changes_json);
      if (itemChanges.source_id) {
        const meta = safelyParseJSON(activity.meta);
        if (meta && meta.source_name) {
          if (itemChanges.source_id[0] === null) {
            contentTemplate = (
              <span>
                <FormattedMessage
                  id="annotation.addSource"
                  defaultMessage="Source {name} add by {author}"
                  description="Log entry indicating a source has been added"
                  values={{
                    name: meta.source_name,
                    author: authorName,
                  }}
                />
              </span>
            );
          } else {
            contentTemplate = (
              <span>
                <FormattedMessage
                  id="annotation.updateSource"
                  defaultMessage="Source {name} updated by {author}"
                  description="Log entry indicating an item status has been changed"
                  values={{
                    name: meta.source_name,
                    author: authorName,
                  }}
                />
              </span>
            );
          }
        }
      } else if (itemChanges.archived) {
        if (itemChanges.archived[1] === CheckArchivedFlags.SPAM) {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.markedAsSpam"
                defaultMessage="Marked as Spam by {author}"
                description="Log entry indicating an item marked as spam"
                values={{
                  author: authorName,
                }}
              />
            </span>
          );
        } else if (itemChanges.archived[1] === CheckArchivedFlags.TRASHED) {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.markAsSpam"
                defaultMessage="Send to Trash by {author}"
                description="Log entry indicating an item send to trash"
                values={{
                  author: authorName,
                }}
              />
            </span>
          );
        } else if (itemChanges.archived[1] === CheckArchivedFlags.NONE) {
          if (itemChanges.archived[0] === CheckArchivedFlags.SPAM) {
            contentTemplate = (
              <span>
                <FormattedMessage
                  id="annotation.notSpam"
                  defaultMessage="Not spam by {author}"
                  description="Log entry indicating an item not spam"
                  values={{
                    author: authorName,
                  }}
                />
              </span>
            );
          } else if (itemChanges.archived[0] === CheckArchivedFlags.TRASHED) {
            contentTemplate = (
              <span>
                <FormattedMessage
                  id="annotation.restoreFromTrash"
                  defaultMessage="Restore from Trash by {author}"
                  description="Log entry indicating an item restore from trash"
                  values={{
                    author: authorName,
                  }}
                />
              </span>
            );
          }
        }
      }
      break;
    }
    case 'create_claimdescription':
    case 'update_claimdescription': {
      const claimDescriptionChanges = safelyParseJSON(activity.object_changes_json);
      if (claimDescriptionChanges.description) {
        if (claimDescriptionChanges.description[0]) {
          contentTemplate = (
            <span className="annotation__claim-description">
              <FormattedMessage
                id="annotation.updateClaimDescription"
                defaultMessage="Claim edited by {author}: {value}"
                description="Log entry indicating a claim has been edited"
                values={{
                  author: authorName,
                  value: object.description,
                }}
              />
            </span>
          );
        } else {
          contentTemplate = (
            <span className="annotation__claim-description">
              <FormattedMessage
                id="annotation.createClaimDescription"
                defaultMessage="Claim added by {author}: {value}"
                description="Log entry indicating a claim has been added"
                values={{
                  author: authorName,
                  value: object.description,
                }}
              />
            </span>
          );
        }
      } else if (claimDescriptionChanges.context) {
        if (claimDescriptionChanges.context[0]) {
          contentTemplate = (
            <span className="annotation__claim-context">
              <FormattedMessage
                id="annotation.updateClaimContext"
                defaultMessage="Additional content edited by {author}: {value}"
                description="Log entry indicating the additional content has been edited"
                values={{
                  author: authorName,
                  value: object.context,
                }}
              />
            </span>
          );
        } else {
          contentTemplate = (
            <span className="annotation__claim-context">
              <FormattedMessage
                id="annotation.createClaimContext"
                defaultMessage="Additional content added by {author}: {value}"
                description="Log entry indicating additional content has been added"
                values={{
                  author: authorName,
                  value: object.context,
                }}
              />
            </span>
          );
        }
      }
      break;
    }
    case 'create_factcheck':
      contentTemplate = (
        <span className="annotation__claim-factcheck">
          <FormattedMessage
            id="annotation.createFactCheck"
            defaultMessage="Fact-check title added by {author}: {value}"
            description="Log entry indicating fact-check title has been added"
            values={{
              author: authorName,
              value: object.title,
            }}
          />
        </span>
      );
      break;
    default:
      contentTemplate = null;
      break;
    }

    if (contentTemplate === null) {
      return null;
    }

    const cardActivities = ['bot_response'];
    const useCardTemplate = (cardActivities.indexOf(activityType) > -1);
    const templateClass = `annotation--${useCardTemplate ? 'card' : 'default'}`;
    const typeClass = annotation ? `annotation--${annotation.annotation_type}` : '';

    return (
      <StyledAnnotationWrapper
        className={`annotation ${templateClass} ${typeClass}`}
        id={`annotation-${activity.dbid}`}
      >
        <StyledDefaultAnnotation className="annotation__default typography-caption">
          <span>
            <span className="annotation__default-content">{contentTemplate}</span>
            {timestamp}
          </span>
        </StyledDefaultAnnotation>
      </StyledAnnotationWrapper>
    );
  }
}

Annotation.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  setFlashMessage: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default withSetFlashMessage(injectIntl(Annotation));
