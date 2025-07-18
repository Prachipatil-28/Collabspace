// src/components/MainContent/MainContent.jsx
import React from 'react';
import CollectionForm from './CollectionForm';
import SessionForm from './SessionForm';

const MainContent = ({ activeItem }) => {
  if (activeItem.type === "collection") {
    return <CollectionForm collection={activeItem} />;
  } else if (activeItem.type === "session") {
    return <SessionForm session={activeItem} />;
  }
  return <div>Select an item to view details.</div>;
};

export default MainContent;
