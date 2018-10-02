import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckboxNext from '@material-ui/core/Checkbox';
import styled from 'styled-components';
import difference from 'lodash.difference';
import intersection from 'lodash.intersection';
import CheckContext from '../../CheckContext';
import { black54, black87, caption, units, opaqueBlack02, opaqueBlack05 } from '../../styles/js/shared';
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

class TagPicker extends React.Component {
  handleCreateTag(value) {
    const { media } = this.props;

    const context = new CheckContext(this).getContextStore();

    const onSuccess = () => {};
    const onFailure = () => {};

    createTag(
      {
        media,
        value,
        annotator: context.currentUser,
      },
      onSuccess, onFailure,
    );
  }

  handleRemoveTag = (value) => {
    const { media } = this.props;

    const removedTag = this.props.tags.find(tag => tag.node.tag_text === value);

    const onSuccess = () => {};
    const onFailure = () => {};

    deleteTag(
      {
        media,
        tagId: removedTag.node.id,
      },
      onSuccess, onFailure,
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
              defaultMessage="{team} team tags"
              values={{ team: media.team.name }}
            />
          </StyledHeadingFirst>
          {
            shownSuggestedCount === 0 ?
              <StyledNone>
                <FormattedMessage id="tagPicker.none" defaultMessage="None" />
              </StyledNone>
              :
              checkedSuggestedTags.concat(uncheckedSuggestedTags).map((tag, index) => (
                <FormControlLabel
                  key={`team-suggested-tag-${index.toString()}`}
                  control={
                    <CheckboxNext
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
                <FormControlLabel
                  key={`team-used-tag-${index.toString()}`}
                  control={
                    <CheckboxNext
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

TagPicker.contextTypes = {
  store: PropTypes.object,
};

export default TagPicker;
