import React from 'react';

export const SpacebarHint: React.FC = React.memo(() => {
  return (
    <div className="spacebar-hint">
      <span>use spacebar to move object/shape | ctrl + scroll to zoom</span>
    </div>
  );
});

SpacebarHint.displayName = 'SpacebarHint';
