import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Dashboard, Settings, People } from '@mui/icons-material';

const Sidebar = ({ openCollabModal }) => {
  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}>
      <List>
        <ListItem button>
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={openCollabModal}>
          <ListItemIcon>
            <People />
          </ListItemIcon>
          <ListItemText primary="Collaborators" />
        </ListItem>
        <Divider />
        <ListItem button>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
