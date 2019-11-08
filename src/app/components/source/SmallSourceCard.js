import React from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router';
import FaFeed from 'react-icons/lib/fa/feed';
import Card from '@material-ui/core/Card';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import MediaUtil from '../media/MediaUtil';
import { units, Offset, Row, StyledHeading } from '../../styles/js/shared';

const Content = styled.div`
  width: ${props => (props.withImage ? units(21) : units(32))};
  height: ${units(10)};
  display: flex;
  flex-direction: column;
`;

const UpperRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const BottomRow = styled.div`
  width: 100%;
  margin-top: ${units(1)};
  display: flex;
  svg {
    min-width: ${units(2)} !important;
    min-height: ${units(2)} !important;
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(1)};
  }
`;

const SmallSourceCard = (props) => {
  console.log('props', props);
  const { source, intl: { locale } } = props;

  const isRtl = rtlDetect.isRtlLang(locale);

  const sourceUrl = source.team && source.dbid > 0
    ? `/${source.team.slug}/project/${source.project_id}/source/${source.dbid}`
    : null;

  return (
    <Card
      className="source-card"
      style={{ height: units(12), width: units(35) }}
    >
      <div
        style={{ padding: units(1), height: units(12), cursor: source.dbid === 0 ? 'wait' : 'default' }}
      >
        <Row>
          { source.source.image ?
            <Offset isRtl={isRtl}>
              <Link to={{ pathname: sourceUrl, state: { query: props.query } }}>
                <img
                  alt=""
                  style={{ width: units(10), height: units(10), objectFit: 'cover' }}
                  src={source.source.image}
                />
              </Link>
            </Offset>
            : null
          }
          <Content withImage={source.source.image}>
            <UpperRow>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: units(5) }}>
                <Row>
                  <StyledHeading>
                    <Link to={{ pathname: sourceUrl, state: { query: props.query } }}>
                      <FaFeed style={{ width: 16 }} />
                      {' '}
                      {source.source.name}
                    </Link>
                  </StyledHeading>
                </Row>
              </div>
            </UpperRow>
            <BottomRow isRtl={isRtl}>
              { source.source.accounts.edges.map(a => MediaUtil.socialIcon(a.node.provider)) }
            </BottomRow>
          </Content>
        </Row>
      </div>
    </Card>
  );
};


export default injectIntl(SmallSourceCard);
