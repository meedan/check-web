/* eslint-disable react/sort-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { Link } from 'react-router';
import cx from 'classnames/bind';
import ParsedText from '../ParsedText';
import TimeBefore from '../TimeBefore';
import DatetimeTaskResponse from '../task/DatetimeTaskResponse';
import { languageLabel } from '../../LanguageRegistry';
import {
  getStatus,
  getStatusStyle,
  emojify,
  parseStringUnixTimestamp,
  safelyParseJSON,
} from '../../helpers';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import styles from './Annotation.module.css';

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class Annotation extends Component {
  static renderTaskResponse(type, object) {
    if (type === 'multiple_choice') {
      const response = safelyParseJSON(object.value, {});
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
            href={`http://www.openstreetmap.org/?mlat=${coordinates[0]}&mlon=${coordinates[1]}&zoom=12#map=12/${coordinates[0]}/${coordinates[1]}`}
            rel="noreferrer noopener"
            style={{ textDecoration: 'underline' }}
            target="_blank"
          >
            <ParsedText block text={name} />
          </a>
        );
      }
      return <ParsedText block text={name} />;
    } else if (type === 'datetime') {
      return <DatetimeTaskResponse response={object.value} />;
    }
    return <ParsedText block text={object.value} />;
  }

  render() {
    const { annotation: activity, annotation: { annotation } } = this.props;
    const updatedAt = parseStringUnixTimestamp(activity.created_at);
    const timestamp = updatedAt
      ? <span className={cx('test-annotation__timestamp', styles['annotation-timestamp'])}><TimeBefore date={updatedAt} /></span>
      : null;
    const authorName = activity.user
      ? <span className="annotation__author-name" > {activity.user.name} </span> : null;
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
              defaultMessage="Tag #{tag} added by {author}"
              description="Log entry indicating a tag was added"
              id="annotation.taggedHeader"
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
              defaultMessage="Annotation field created by {author}: {fieldLabel}"
              description="Log entry indicating an annotation field was created"
              id="annotation.metadataCreated"
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
                defaultMessage="Item merged by {author} with {title}"
                description="Log entry indicating a similarity match was confirmed"
                id="annotation.similarCreated"
                values={{
                  title: (<Link target="_blank" to={source.url}>{emojify(source.title)}</Link>),
                  author: relationshipAuthor,
                }}
              /> : null }
            { /suggested/.test(type) ?
              <FormattedMessage
                defaultMessage="Match suggested by {author}: {title}"
                description="Log entry indicating a similarity match was suggested"
                id="annotation.suggestionCreated"
                values={{
                  title: (<Link target="_blank" to={source.url}>{emojify(source.title)}</Link>),
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
                defaultMessage="Match deleted by {author}: {title}"
                description="Tells that one item previously confirmed as similar has been detached from current item."
                id="annotation.similarDestroyed"
                values={{
                  title: (<Link target="_blank" to={source.url}>{emojify(source.title)}</Link>),
                  author: relationshipAuthor,
                }}
              /> : null }
            { /suggested_sibling/.test(type) ?
              <FormattedMessage
                defaultMessage="Match rejected by {author}: {title}"
                description="Log entry indicating a similarity match was rejected"
                id="annotation.suggestionDestroyed"
                values={{
                  title: (<Link target="_blank" to={source.url}>{emojify(source.title)}</Link>),
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
        const { title, type, user_name } = meta;
        const values = {
          title,
          name: user_name,
          author: authorName,
        };
        if (type === 'task') {
          contentTemplate = (
            <span>
              <FormattedMessage
                defaultMessage="Task assigned to {name} by {author}: {title}"
                description="Log entry indicating a task has been assigned"
                id="annotation.taskAssignmentCreated"
                values={values}
              />
            </span>
          );
        }
        if (type === 'media') {
          contentTemplate = (
            <span>
              <FormattedMessage
                defaultMessage="Item assigned to {name} by {author}"
                description="Log entry indicating an item has been assigned"
                id="annotation.mediaAssignmentCreated"
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
        const { title, type, user_name } = meta;
        const values = {
          title,
          name: user_name,
          author: authorName,
        };
        if (type === 'task') {
          contentTemplate = (
            <span>
              <FormattedMessage
                defaultMessage="Task unassigned from {name} by {author}: {title}"
                description="Log entry indicating a task has been unassigned"
                id="annotation.taskAssignmentDeleted"
                values={values}
              />
            </span>
          );
        }
        if (type === 'media') {
          contentTemplate = (
            <span>
              <FormattedMessage
                defaultMessage="Item unassigned from {name} by {author}"
                description="Log entry indicating an item has been unassigned"
                id="annotation.mediaAssignmentDeleted"
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
                defaultMessage="Item status locked by {author}"
                description="Log entry indicating an item status has been locked"
                id="annotation.statusLocked"
                values={{ author: authorName }}
              />
            );
          } else {
            contentTemplate = (
              <FormattedMessage
                defaultMessage="Item status unlocked by {author}"
                description="Log entry indicating an item status has been unlocked"
                id="annotation.statusUnlocked"
                values={{ author: authorName }}
              />
            );
          }
        } else if (statusChanges.assigned_to_id) {
          const assignment = safelyParseJSON(activity.meta);
          if (assignment.assigned_to_name) {
            contentTemplate = (
              <FormattedMessage
                defaultMessage="Item assigned to {name} by {author}"
                description="Log entry indicating an item has been assigned"
                id="annotation.mediaAssigned"
                values={{
                  name: assignment.assigned_to_name,
                  author: authorName,
                }}
              />
            );
          } else {
            contentTemplate = (
              <FormattedMessage
                defaultMessage="Item unassigned from {name} by {author}"
                description="Log entry indicating an item has been unassigned"
                id="annotation.mediaUnassigned"
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
        if (reportDesignChange && reportDesignChange[0]) {
          if (reportDesignChange[0].state !== reportDesignChange[1].state) {
            if (reportDesignChange[1].state === 'published') {
              contentTemplate = (
                <FormattedMessage
                  defaultMessage="Fact-check published by {author}"
                  description="Log entry indicating a report state has been published"
                  id="annotation.reportDesignPublishedState"
                  values={{
                    author: authorName,
                  }}
                />
              );
            } else if (reportDesignChange[1].state === 'paused') {
              contentTemplate = (
                <FormattedMessage
                  defaultMessage="Fact-check paused by {author}"
                  description="Log entry indicating a report state has been paused"
                  id="annotation.reportDesignPausedState"
                  values={{
                    author: authorName,
                  }}
                />
              );
            }
          }
        }
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
              defaultMessage="Status changed to {status} by {author}"
              description="Log entry indicating an item status has been changed"
              id="annotation.statusSetHeader"
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
                    className="annotation__card-thumbnail annotation__bot-response-thumbnail"
                    style={{
                      background: `transparent url('${botResponse.image_url}') top left no-repeat`,
                      backgroundSize: 'cover',
                      border: '1px solid var(--color-gray-88)',
                      width: 80,
                      height: 80,
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
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
            defaultMessage="Unknown language"
            description="Show label for undefined language"
            id="annotation.unknownLanguage"
          />
        );
        contentTemplate = activityType === 'create_dynamicannotationfield' ? (
          <span>
            <FormattedMessage
              defaultMessage="Language {value} added by {author}"
              description="Log entry indicating an item language has been set. {value} receives language name"
              id="annotation.addLanguage"
              values={{
                value: languageName,
                author: 'Check',
              }}
            />
          </span>
        ) : (
          <span>
            <FormattedMessage
              defaultMessage="Language {value} updated by {author}"
              description="Log entry indicating an item language has been updated. {value} receives language name"
              id="annotation.updateLanguage"
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
                defaultMessage='Annotation "{fieldLabel}" edited by {author}: {response}'
                description="Log entry indicating an annotation response has been changed"
                id="annotation.metadataResponse"
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
                defaultMessage="This item is being archived at {name}. The archive link will be displayed here when it's ready."
                id="annotation.archiverWait"
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
              defaultMessage="Source {name} added by {author}"
              description="Log entry indicating a source has been added"
              id="annotation.addSource"
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
              defaultMessage="Item created by {author}"
              description="Log entry indicating an item has been created"
              id="annotation.createProjectMedia"
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
                  defaultMessage="Source {name} added by {author}"
                  description="Log entry indicating a source has been added"
                  id="annotation.addSource"
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
                  defaultMessage="Source {name} updated by {author}"
                  description="Log entry indicating an item status has been changed"
                  id="annotation.updateSource"
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
                defaultMessage="Marked as Spam by {author}"
                description="Log entry indicating an item marked as spam"
                id="annotation.markedAsSpam"
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
                defaultMessage="Sent to Trash by {author}"
                description="Log entry indicating an item sent to trash"
                id="annotation.markAsSpam"
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
                  defaultMessage="Marked as not Spam by {author}"
                  description="Log entry indicating an item not spam"
                  id="annotation.notSpam"
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
                  defaultMessage="Restored from Trash by {author}"
                  description="Log entry indicating an item restored from trash"
                  id="annotation.restoreFromTrash"
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
      contentTemplate = (
        <span className="annotation__claim-description">
          <FormattedMessage
            defaultMessage="Claim added by {author}: {value}"
            description="Log entry indicating a claim has been added"
            id="annotation.createClaimDescription"
            values={{
              author: authorName,
              value: object.description,
            }}
          />
        </span>
      );
      break;
    case 'update_claimdescription': {
      const claimDescriptionChanges = safelyParseJSON(activity.object_changes_json);
      if (claimDescriptionChanges.project_media_id) {
        if (claimDescriptionChanges.project_media_id[0]) {
          contentTemplate = (
            <span className="annotation__claim-remove-item">
              <FormattedMessage
                defaultMessage="Fact-check removed by {author}"
                description="Log entry indicating a claim has been removed"
                id="annotation.removeItem"
                values={{
                  author: authorName,
                }}
              />
            </span>
          );
        } else {
          contentTemplate = (
            <span className="annotation__claim-add-item">
              <FormattedMessage
                defaultMessage="Fact-check added by {author}"
                description="Log entry indicating a claim has been added"
                id="annotation.addItem"
                values={{
                  author: authorName,
                }}
              />
            </span>
          );
        }
      } else if (claimDescriptionChanges.description) {
        if (claimDescriptionChanges.description[0]) {
          contentTemplate = (
            <span className="annotation__claim-description">
              <FormattedMessage
                defaultMessage="Claim edited by {author}: {value}"
                description="Log entry indicating a claim has been edited"
                id="annotation.updateClaimDescription"
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
                defaultMessage="Claim added by {author}: {value}"
                description="Log entry indicating a claim has been added"
                id="annotation.createClaimDescription"
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
                defaultMessage="Additional content edited by {author}: {value}"
                description="Log entry indicating the additional content has been edited"
                id="annotation.updateClaimContext"
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
                defaultMessage="Additional content added by {author}: {value}"
                description="Log entry indicating additional content has been added"
                id="annotation.createClaimContext"
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
    case 'update_factcheck':
      contentTemplate = (
        <span className="annotation__claim-add-update-factcheck">
          { /create_factcheck/.test(activityType) ?
            <FormattedMessage
              defaultMessage="Fact-check added by {author}: {value}"
              description="Log entry indicating fact-check title has been added"
              id="annotation.createFactCheck"
              values={{
                author: authorName,
                value: object.title,
              }}
            /> :
            <FormattedMessage
              defaultMessage="Fact-check edited by {author}"
              description="Log entry indicating fact-check has been updated"
              id="annotation.updateFactCheck"
              values={{
                author: authorName,
              }}
            /> }
        </span>
      );
      break;
    case 'create_explaineritem':
    case 'destroy_explaineritem': {
      const meta = safelyParseJSON(activity.meta);
      contentTemplate = (
        <span className="annotation__add-remove-explainer">
          { /create_explaineritem/.test(activityType) ?
            <FormattedMessage
              defaultMessage="Explainer added by {author}: {value}"
              description="Log entry indicating Explainer has been added"
              id="annotation.create_explaineritem"
              values={{
                author: authorName,
                value: meta?.explainer_title,
              }}
            /> :
            <FormattedMessage
              defaultMessage="Explainer removed by {author}: {value}"
              description="Log entry indicating Explainer has been removed"
              id="annotation.remove_explaineritem"
              values={{
                author: authorName,
                value: meta?.explainer_title,
              }}
            /> }
        </span>
      );
      break;
    }
    case 'replace_projectmedia':
      contentTemplate = (
        <span className="annotation__replace-projectmedia">
          <FormattedMessage
            defaultMessage="Media cluster added to imported fact-check and inherited rating by {author}"
            description="Log entry indicating media cluster added to imported fact-check"
            id="annotation.replaceProjectMedia"
            values={{
              author: authorName,
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
      <section
        className={cx(
          `annotation ${templateClass} ${typeClass}`,
          styles['annotation-wrapper'],
        )}
        id={`annotation-${activity.dbid}`}
      >
        <div
          className={cx(
            styles['annotation-default'],
            'annotation__default',
            'typography-caption',
          )}
        >
          <span>
            <span className={cx('test-annotation__default-content', styles['annotation-default-content'])}>{contentTemplate}</span>
            {timestamp}
          </span>
        </div>
      </section>
    );
  }
}

Annotation.propTypes = {
  annotation: PropTypes.object.isRequired, // FIXME: specify shape
  team: PropTypes.shape({
    verification_statuses: PropTypes.object,
  }).isRequired,
};

export default injectIntl(Annotation);
