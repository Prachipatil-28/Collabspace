import React, { useState } from 'react';
import EnhancedNavbar from './CodeNavBar/CodeNavbar';
import Sidebar from './Sidebar/Sidebar';
import FileExplorer from './CodeNavBar/FileOption';
import EditorWindow from './EditorWindow';
import CollaborationModal from './Sidebar/CollaborationModal';
import { Box, Grid } from '@mui/material';

const Editor = () => {
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  const openCollabModal = () => setIsCollabModalOpen(true);
  const closeCollabModal = () => setIsCollabModalOpen(false);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <EnhancedNavbar />
      <Grid container sx={{ flexGrow: 1 }}>
        {/* Left Sidebar */}
        <Grid item xs={1} sx={{ borderRight: 1, borderColor: 'divider' }}>
          <Sidebar openCollabModal={openCollabModal} />
        </Grid>
        {/* File Explorer Panel */}
        <Grid item xs={2} sx={{ borderRight: 1, borderColor: 'divider' }}>
          <FileExplorer />
        </Grid>
        {/* Main Editor Area */}
        <Grid item xs={9}>
          <EditorWindow />
        </Grid>
      </Grid>
      {isCollabModalOpen && <CollaborationModal closeModal={closeCollabModal} />}
    </Box>
  );
};

export default Editor;
