import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

function HomeIcon(props: SvgIconProps): JSX.Element {
  return (
    <SvgIcon {...props} viewBox="0 0 18 18">
      <path
        d="M2.25 6.75L9 1.5L15.75 6.75V15C15.75 15.3978 15.592 15.7794 15.3107 16.0607C15.0294 16.342 14.6478 16.5 14.25 16.5H3.75C3.35218 16.5 2.97064 16.342 2.68934 16.0607C2.40804 15.7794 2.25 15.3978 2.25 15V6.75Z"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 16.5V9H11.25V16.5"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

export default HomeIcon;
