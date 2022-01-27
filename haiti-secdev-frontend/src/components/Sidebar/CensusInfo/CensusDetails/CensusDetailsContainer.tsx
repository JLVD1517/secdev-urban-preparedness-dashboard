import React from 'react';
import CensusDetailed from './CensusDetailed';
import { mapLayers } from '../../../../configuration/app-config';
import {
  CensusDetailedType,
  CensusFieldType,
  SelectedItemType,
} from '../../../../types';

interface CensusDetailsContainerProps {
  selectedItem: SelectedItemType;
}

const CensusDetailsContainer: React.FC<CensusDetailsContainerProps> = ({
  selectedItem,
}) => {
  const getCards = () => {
    const cardList: CensusDetailedType[] = [];

    mapLayers.forEach(layer => {
      if (layer.subcategories.length > 0) {
        const cardInfo: CensusDetailedType = {
          title: layer.title,
          value: selectedItem[layer.colName],
          fields: [],
        };

        layer.subcategories.forEach(subCat => {
          const subCatInfo: CensusFieldType = {
            title: subCat.title,
            value: selectedItem[subCat.colName],
          };
          if (subCat.percentColName) {
            subCatInfo.percentValue = selectedItem[subCat.percentColName];
          }
          cardInfo.fields.push(subCatInfo);
        });

        cardList.push(cardInfo);
      }
    });
    return cardList;
  };

  return (
    <>
      {getCards().map(item => {
        return <CensusDetailed key={item.title} item={item} />;
      })}
    </>
  );
};

export default CensusDetailsContainer;
