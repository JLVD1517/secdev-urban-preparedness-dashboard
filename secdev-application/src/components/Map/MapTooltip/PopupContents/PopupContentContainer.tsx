import React from 'react';
import { useSelector } from 'react-redux';
import ThemeContainer from '../../../../ThemeContainer';
import { AppState, SelectedItemType } from '../../../../types';
import PopupContent from './PopupContent';

interface PopupContentContainerProps {
  clickedItem: SelectedItemType;
}

const PopupContentContainer: React.FC<PopupContentContainerProps> = ({
  clickedItem,
}) => {
  const darkTheme: boolean = useSelector(
    (state: AppState) => state.AppControl.darkTheme,
  );

  return (
    <ThemeContainer darkThemeEnabled={darkTheme}>
      <PopupContent clickedItem={clickedItem} darkTheme={darkTheme} />
    </ThemeContainer>
  );
};

export default PopupContentContainer;
