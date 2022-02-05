import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

function MenuIcon(props: SvgIconProps): JSX.Element {
  return (
    <SvgIcon {...props} viewBox="0 0 18 18">
      <path
        d="M2 9H12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.25 4.5H15.75"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.25 13.5H15.75"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

export default MenuIcon;
