import React from 'react';

// This component is designed to crash on purpose via unsafe property access
const SandboxCrash = () => {
  const foo = {};

  return (
    <div>
      {foo.bar.baz}
    </div>
  );
};

export default SandboxCrash;

