import React from 'react';
import { FormattedMessage } from 'react-intl';
import ParsedText from '../ParsedText';

class TaskUpdate extends React.Component {
  shouldLogChange(activity) {
    const changes = JSON.parse(activity.object_changes_json);

    if (changes.data) {
      ([this.from, this.to] = changes.data);

      if (this.from.label && this.to.label && this.from.label !== this.to.label) {
        this.editedTitle = true;
      }
      if (this.to.description && this.from.description !== this.to.description) {
        this.editedNote = true;
      }
      if (!this.from.description && this.to.description) {
        this.editedNote = false;
        this.createdNote = true;
      }
      if (this.from.log_count < this.to.log_count || (!this.from.log_count && this.to.log_count)) {
        this.addedComment = true;
      }
      if (this.from.log_count > this.to.log_count) {
        this.removedComment = true;
      }
      if (this.from.required !== this.to.required) {
        this.isNowRequired = this.to.required;
        this.isNowNotRequired = !this.to.required;
      }
      if (this.from.json_schema !== this.to.json_schema) {
        this.changedJsonSchema = true;
      }
    }
    if (changes.assigned_to_id) {
      if (changes.assigned_to_id[1]) {
        this.changedAssignment = true;
      } else {
        this.removedAssignment = true;
      }
    }
    return this.editedTitle ||
      this.editedNote ||
      this.createdNote ||
      this.changedAssignment ||
      this.removedAssignment ||
      this.addedComment ||
      this.isNowRequired ||
      this.isNowNotRequired ||
      this.removedComment ||
      this.changedJsonSchema;
  }

  render() {
    const { authorName: author, activity } = this.props;

    // TODO nix all these properties and shouldLogChange(). A better approach:
    // make the if-statements construct an Array of child React.Components.
    this.editedTitle = false;
    this.editedNote = false;
    this.createdNote = false;
    this.changedAssignment = false;
    this.removedAssignment = false;
    this.addedComment = false;
    this.removedComment = false;
    this.isNowRequired = false;
    this.isNotRequired = false;
    this.changedJsonSchema = false;
    const shouldLog = this.shouldLogChange(activity); // modifies all the properties.

    if (shouldLog) {
      let title = '';
      let comment = '';
      let assigneeFrom = null;
      let assigneeTo = null;
      if (
        this.changedAssignment ||
        this.removedAssignment ||
        this.addedComment ||
        this.isNowRequired ||
        this.isNowNotRequired ||
        this.removedComment ||
        this.changedJsonSchema
      ) {
        title = JSON.parse(activity.object_after).data.label;
        if (activity.meta) {
          const meta = JSON.parse(activity.meta);
          assigneeFrom = meta.assigned_from_name;
          assigneeTo = meta.assigned_to_name;
          if (meta.annotation_type === 'comment') {
            comment = meta.data.text;
          }
        }
      }

      const contentTemplate = (
        <span>
          <span className="annotation__update-task" />
          {this.editedTitle ?
            <FormattedMessage
              id="annotation.taskLabelUpdated"
              defaultMessage="Task edited by {author}: {title}"
              values={{
                title: this.to.label,
                author,
              }}
            />
            : null}
          {this.editedTitle && this.editedNote ? <br /> : null}
          {this.editedNote ?
            <FormattedMessage
              id="annotation.taskNoteUpdated"
              defaultMessage="Task note edited by {author}: {title}{note}"
              values={{
                title: this.to.label,
                author,
                note: <ParsedText text={this.to.description} block />,
              }}
            />
            : null}
          {this.editedTitle && this.createdNote ? <br /> : null}
          {this.createdNote ?
            <FormattedMessage
              id="annotation.taskNoteCreated"
              defaultMessage="Task note added by {author}: {title}{note}"
              values={{
                title: this.to.label,
                author,
                note: <ParsedText text={this.to.description} block />,
              }}
            />
            : null}
          {((this.editedTitle || this.editedNote || this.createdNote) &&
            (this.changedAssignment || this.removedAssignment)) ? <br /> : null}
          {this.changedAssignment ?
            <FormattedMessage
              id="annotation.assignmentChanged"
              defaultMessage="Task assigned to {assigneeTo} by {author}: {title}"
              values={{
                title,
                assigneeTo,
                author,
              }}
            />
            : null}
          {this.removedAssignment ?
            <FormattedMessage
              id="annotation.assignmentRemoved"
              defaultMessage="Task unassigned from {assigneeFrom} by {author}: {title}"
              values={{
                title,
                assigneeFrom,
                author,
              }}
            />
            : null}
          {this.addedComment ?
            <FormattedMessage
              id="annotation.addedComment"
              defaultMessage="Task note added by {author}: {title}{note}"
              values={{
                title,
                author,
                note: <ParsedText text={comment} block />,
              }}
            />
            : null}
          {this.removedComment ?
            <FormattedMessage
              id="annotation.removedComment"
              defaultMessage="Task note deleted by {author}: {title}{note}"
              values={{
                title,
                author,
                note: <ParsedText text={comment} block />,
              }}
            />
            : null}
          {this.isNowRequired ?
            <FormattedMessage
              id="annotation.nowRequired"
              defaultMessage="Task marked as required by {author}: {title}"
              values={{
                title,
                author,
              }}
            />
            : null}
          {this.isNowNotRequired ?
            <FormattedMessage
              id="annotation.nowNotRequired"
              defaultMessage="Task marked as not required by {author}: {title}"
              values={{
                title,
                author,
              }}
            />
            : null}
          {this.changedJsonSchema ?
            <FormattedMessage
              id="annotation.changedJsonSchema"
              defaultMessage="JSON Schema of task {title} changed by {author}"
              values={{
                title,
                author,
              }}
            />
            : null}
        </span>
      );
      return contentTemplate;
    }
    return null;
  }
}

export default TaskUpdate;
