import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';
import IconEdit from '@material-ui/icons/Edit';
import AccountChips from './AccountChips';
import Can from '../Can';
import ParsedText from '../ParsedText';
import MediaUtil from '../media/MediaUtil';
import { truncateLength } from '../../helpers';
import SourcePicture from './SourcePicture';
import {
  StyledContactInfo,
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledName,
  StyledDescription,
} from '../../styles/js/HeaderCard';
import {
  Row,
  SmallerStyledIconButton,
} from '../../styles/js/shared';
import globalStrings from '../../globalStrings';

const UserInfo = (props) => {
  if (props.user.source === null) return null;

  return (
    <StyledTwoColumns>
      <StyledSmallColumn isRtl={rtlDetect.isRtlLang(props.intl.locale)}>
        <SourcePicture
          size="large"
          object={props.user.source}
          type="user"
          className="source__avatar"
        />
      </StyledSmallColumn>

      <StyledBigColumn>
        <div className="source__primary-info">
          <StyledName className="source__name">
            <Row>
              {props.user.name}
              <Can permissions={props.user.permissions} permission="update User">
                <SmallerStyledIconButton
                  className="source__edit-source-button"
                  onClick={() => {
                    if (props.user.dbid === props.context.currentUser.dbid) {
                      props.context.history.push('/check/me/edit');
                    } else {
                      props.context.history.push(`/check/user/${props.user.dbid}/edit`);
                    }
                  }}
                  tooltip={props.intl.formatMessage(globalStrings.edit)}
                >
                  <IconEdit />
                </SmallerStyledIconButton>
              </Can>
            </Row>
          </StyledName>
          <StyledDescription>
            <p>
              <ParsedText text={truncateLength(props.user.source.description, 600)} />
            </p>
          </StyledDescription>
        </div>

        <AccountChips
          accounts={props.user.source.account_sources.edges.map(as => as.node.account)}
        />

        <StyledContactInfo>
          <FormattedHTMLMessage
            id="UserInfo.dateJoined"
            defaultMessage="Joined {date} &bull; {teamsCount, plural, =0 {} one {1 workspace} other {# workspaces}}"
            values={{
              date: props.intl.formatDate(
                MediaUtil.createdAt({ published: props.user.source.created_at }),
                { year: 'numeric', month: 'short', day: '2-digit' },
              ),
              teamsCount: props.user.team_users.edges.length || 0,
            }}
          />
        </StyledContactInfo>
      </StyledBigColumn>
    </StyledTwoColumns>
  );
};

export default injectIntl(UserInfo);
