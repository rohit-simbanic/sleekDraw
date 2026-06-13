import React from 'react';

export const SpacebarHint: React.FC = React.memo(() => {
  return (
    <div className="spacebar-hint desktop-only">
      <span>use spacebar to move object/shape | ctrl + scroll to zoom</span>
    </div>
  );
});

SpacebarHint.displayName = 'SpacebarHint';
