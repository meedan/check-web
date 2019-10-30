import React from 'react';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
import isEqual from 'lodash.isequal';
import rtlDetect from 'rtl-detect';
import CreateProjectMedia from '../media/CreateMedia';
import EmptyTrashButton from '../team/EmptyTrashButton';
import Can from '../Can';
import { black05, black87, units, Row, FlexRow, Offset } from '../../styles/js/shared';

const StyledToolbar = styled.div`
  background-color: ${black05};
  min-height: ${units(5)};
  margin: 0 ${units(1)};

  .toolbar__title {
    color: ${black87};
    margin: ${units(2)};
  }
`;

class Toolbar extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState) ||
           !isEqual(this.props, nextProps);
  }

  render() {
    const {
      filter,
      actions,
      title,
      project,
      addons,
      page,
      search,
    } = this.props;

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    return (
      <StyledToolbar className="toolbar">
        <FlexRow>
          <Row>
            {filter} | {actions} {actions ? '|' : null} <span className="toolbar__title">{title}</span>
          </Row>
          <Offset isRtl={isRtl}>
            { project ?
              <Can permissions={project.permissions} permission="create Media">
                <CreateProjectMedia search={search} />
              </Can>
              : null
            }
            { page === 'trash' ?
              <EmptyTrashButton teamSlug={filter.props.teamSlug} search={search} /> : null
            }
            {addons}
          </Offset>
        </FlexRow>
      </StyledToolbar>
    );
  }
}

export default injectIntl(Toolbar);
