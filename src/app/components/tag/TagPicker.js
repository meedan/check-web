import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import difference from 'lodash.difference';
import intersection from 'lodash.intersection';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';
import CheckContext from '../../CheckContext';
import { black54, black87, caption, units, opaqueBlack02, opaqueBlack05, StyledCheckboxNext } from '../../styles/js/shared';
import { createTag } from '../../relay/mutations/CreateTagMutation';
import { deleteTag } from '../../relay/mutations/DeleteTagMutation';

const StyledHeadingFirst = styled.div`
  color: ${black87};
  font: ${caption};
`;

const StyledHeading = styled(StyledHeadingFirst)`
  padding-top: ${units(3)};
`;

const StyledNone = styled.div`
  color: ${black54};
  padding-top: ${units(1)};
`;

const StyledNotFound = styled.div`
  color: ${black54};
  padding-top: ${units(14)};
  display: flex;
  justify-content: center;
`;

const StyledTagPickerArea = styled.div`
  padding: ${units(2)};
  height: ${units(32)};
  overflow-y: auto;
  border: 1px solid ${opaqueBlack05};
  background-color: ${opaqueBlack02};
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  margin-${props => props.direction.from}: -14px !important;
  margin-${props => props.direction.to}: 16px !important;
`;

class TagPicker extends React.Component {
  fail = (transaction) => {
    const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const message = getErrorMessage(transaction, fallbackMessage);
    this.context.setMessage(message);
  };

  handleCreateTag(value) {
    const { media } = this.props;

    const context = new CheckContext(this).getContextStore();

    const onSuccess = (data) => {
      const pm = data.createTag.project_media;
      let path = '';
      let currentProjectId = window.location.pathname.match(/project\/([0-9]+)/);
      if (currentProjectId) {
        [path, currentProjectId] = currentProjectId;
      }
      if (pm.project_id && currentProjectId &&
        parseInt(pm.project_id, 10) !== parseInt(currentProjectId, 10)) {
        const newPath = window.location.pathname.replace(path, `project/${pm.project_id}`);
        window.location.assign(newPath);
      }
    };

    createTag(
      {
        media,
        value,
        annotator: context.currentUser,
      },
      onSuccess, this.fail,
    );
  }

  handleRemoveTag = (value) => {
    const { media } = this.props;

    const removedTag = this.props.tags.find(tag => tag.node.tag_text === value);

    const onSuccess = () => {};

    deleteTag(
      {
        media,
        tagId: removedTag.node.id,
      },
      onSuccess, this.fail,
    );
  };

  handleSelectCheckbox = (e, inputChecked) => {
    if (inputChecked) {
      this.handleCreateTag(e.target.id);
    } else {
      this.handleRemoveTag(e.target.id);
    }
  }

  renderNotFound(shownTagsCount, totalTagsCount) {
    if (totalTagsCount === 0) {
      return (
        <StyledNotFound>
          <FormattedMessage
            id="tagPicker.emptyTags"
            defaultMessage="There are currently no tags for this team."
          />
        </StyledNotFound>
      );
    }

    return (
      <StyledNotFound>
        <FormattedMessage
          id="tagPicker.tagNotFound"
          defaultMessage="Tag #{tag} not found."
          values={{ tag: this.props.value }}
        />
      </StyledNotFound>
    );
  }

  render() {
    const { media, tags, value } = this.props;

    const compareString = (tag, val) => {
      if (!tag) {
        return false;
      }
      return tag.toLowerCase().includes(val.toLowerCase());
    };

    const plainMediaTags = tags.map(tag => tag.node.tag_text);

    const suggestedTags = media.team && media.team.get_suggested_tags
      ? media.team.get_suggested_tags.split(',').filter(tag => compareString(tag, value))
      : [];

    const nonRepeatedUsedTags =
      difference(media.team.used_tags, suggestedTags).filter(tag => compareString(tag, value));

    const checkedSuggestedTags = intersection(suggestedTags, plainMediaTags);
    const uncheckedSuggestedTags = difference(suggestedTags, plainMediaTags);

    const checkedUsedTags =
      difference(plainMediaTags, suggestedTags).filter(tag => compareString(tag, value));
    const uncheckedUsedTags = difference(nonRepeatedUsedTags, plainMediaTags);

    const shownSuggestedCount = checkedSuggestedTags.length + uncheckedSuggestedTags.length;
    const shownUsedCount = checkedUsedTags.length + uncheckedUsedTags.length;

    const shownTagsCount = shownSuggestedCount + shownUsedCount;
    const totalTagsCount = suggestedTags.length + tags.length + media.team.used_tags.length;

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);
    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    return (shownTagsCount === 0 ?
      <StyledTagPickerArea>
        { this.renderNotFound(shownTagsCount, totalTagsCount) }
      </StyledTagPickerArea>
      :
      <StyledTagPickerArea>
        <FormGroup>
          <StyledHeadingFirst>
            <FormattedMessage
              id="tagPicker.teamTags"
              defaultMessage="Team tags"
            />
          </StyledHeadingFirst>
          {
            shownSuggestedCount === 0 ?
              <StyledNone>
                <FormattedMessage id="tagPicker.none" defaultMessage="None" />
              </StyledNone>
              :
              checkedSuggestedTags.concat(uncheckedSuggestedTags).map((tag, index) => (
                <StyledFormControlLabel
                  direction={direction}
                  key={`team-suggested-tag-${index.toString()}`}
                  control={
                    <StyledCheckboxNext
                      checked={plainMediaTags.includes(tag)}
                      onChange={this.handleSelectCheckbox}
                      id={tag}
                    />
                  }
                  label={tag}
                />
              ))
          }
          <StyledHeading>
            <FormattedMessage id="tagPicker.teamOtherTags" defaultMessage="Custom tags" />
          </StyledHeading>
          {
            shownUsedCount === 0 ?
              <StyledNone>
                <FormattedMessage id="tagPicker.none" defaultMessage="None" />
              </StyledNone>
              :
              checkedUsedTags.concat(uncheckedUsedTags).map((tag, index) => (
                <StyledFormControlLabel
                  direction={direction}
                  key={`team-used-tag-${index.toString()}`}
                  control={
                    <StyledCheckboxNext
                      checked={plainMediaTags.includes(tag)}
                      onChange={this.handleSelectCheckbox}
                      id={tag}
                    />
                  }
                  label={tag}
                />
              ))
          }
        </FormGroup>
      </StyledTagPickerArea>
    );
  }
}

TagPicker.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

TagPicker.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

export default injectIntl(TagPicker);
