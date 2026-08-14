import React from 'react';
import useAnimatedCounterLogic from './useAnimatedCounterLogic';

const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const { count, ref } = useAnimatedCounterLogic(end, duration);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export default AnimatedCounter;
