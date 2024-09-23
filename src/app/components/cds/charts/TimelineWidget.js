import React from 'react';
import PropTypes from 'prop-types';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from 'recharts';
import styles from './VerticalBarChartWidget.module.css';

const TimelineWidget = ({
  data,
  height,
  title,
  tooltipFormatter,
  width,
}) => (
  <div
    className={styles.verticalBarChartWidgetWrapper}
    style={{ height, width }}
  >
    <div className={styles.verticalBarChartWidgetTitle}>
      {title}
    </div>
    <ResponsiveContainer>
      <AreaChart data={data}>
        <Area
          dataKey="value"
          dot={false}
          fill="#86dd3d"
          fillOpacity={0.1}
          stroke="#86dd3d"
          strokeWidth={2}
          type="linear"
        />
        <XAxis
          axisLine={false}
          dataKey="label"
          interval="equidistantPreserveStart"
          tick={{ fill: 'var(--color-gray-15)' }}
          tickLine={{ stroke: 'var(--color-gray-75)' }}
          type="category"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-white-100)',
            border: 'solid 1px #9643F5',
            borderRadius: '4px',
          }}
          cursor={false}
          formatter={tooltipFormatter}
          itemStyle={{ color: 'var(--color-gray-15)' }}
          labelFormatter={value => `${value}, 2024:`}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

TimelineWidget.defaultProps = {
  data: [],
  height: 150,
  tooltipFormatter: value => value,
  width: '100%',
};

TimelineWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.number,
  })),
  height: PropTypes.number,
  title: PropTypes.string.isRequired,
  tooltipFormatter: PropTypes.func,
  width: PropTypes.number,
};

export default TimelineWidget;
