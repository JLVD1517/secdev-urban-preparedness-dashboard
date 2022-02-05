import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { SelectedItemType } from '../../../types';
import PopupContentContainer from './PopupContents/PopupContentContainer';

interface PopupProps {
  clickedItem: SelectedItemType;
}

const Popup: React.FC<PopupProps> = ({ clickedItem }) => {
  return (
    <Provider store={store}>
      <PopupContentContainer clickedItem={clickedItem} />
    </Provider>
  );
};

export default Popup;
