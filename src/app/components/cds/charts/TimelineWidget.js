import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from 'recharts';
import styles from './TimelineWidget.module.css';

const TimelineWidget = ({
  areaColor,
  data,
  height,
  intl,
  lineColor,
  title,
  tooltipFormatter,
  width,
}) => {
  const tickFormatter = intl ?
    value => intl.formatDate(value, { month: 'short', day: 'numeric' }) :
    value => value;

  const labelFormatter = intl ?
    value => `${intl.formatDate(value, { month: 'long', day: 'numeric', year: 'numeric' })}:` :
    value => value;

  return (
    <div
      className={styles.timelineWidgetWrapper}
      style={{ height, width }}
    >
      <div className={styles.timelineWidgetTitle}>
        {title}
      </div>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <Area
            dataKey="value"
            dot={false}
            fill={areaColor}
            fillOpacity={0.1}
            stroke={lineColor}
            strokeWidth={2}
            type="linear"
          />
          <XAxis
            axisLine={false}
            dataKey="date"
            interval="equidistant"
            tick={{ fill: 'var(--color-gray-15)' }}
            tickFormatter={tickFormatter}
            tickLine={{ stroke: 'var(--color-gray-75)' }}
            type="category"
          />
          <Tooltip
            allowEscapeViewBox={{ y: true }}
            contentStyle={{
              backgroundColor: 'var(--color-white-100)',
              border: 'solid 1px var(--color-purple-61)',
              borderRadius: '4px',
              padding: '4px 8px',
            }}
            cursor={false}
            formatter={tooltipFormatter}
            itemStyle={{ color: 'var(--color-gray-15)' }}
            labelFormatter={labelFormatter}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

TimelineWidget.defaultProps = {
  areaColor: 'var(--color-green-50)',
  data: [],
  height: '150px',
  lineColor: 'var(--color-green-50)',
  tooltipFormatter: value => value,
  width: '100%',
};

TimelineWidget.propTypes = {
  areaColor: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    value: PropTypes.number,
  })),
  height: PropTypes.number,
  lineColor: PropTypes.string,
  title: PropTypes.node.isRequired,
  tooltipFormatter: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export { TimelineWidget }; // eslint-disable-line import/no-unused-modules

export default injectIntl(TimelineWidget);
