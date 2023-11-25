import React from 'react';

function RanbowSpan({children, ...props}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className={`bg-gradient-to-r from-cyan-500 via-green-500 to-blue-500 text-transparent bg-clip-text ${props.className??''}`}>
      {children}
    </span>
  );
}

export default RanbowSpan;