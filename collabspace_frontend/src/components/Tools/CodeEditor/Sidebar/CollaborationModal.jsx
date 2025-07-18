import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Select, MenuItem, FormControl } from '@mui/material';

const CollaborationModal = ({ closeModal }) => {
  // Fixed collaborator list with one static user.
  const collaborators = [
    { id: 1, name: 'User', permission: 'edit' }
  ];

  const handlePermissionChange = (id, newPermission) => {
    // Handle permission change logic – update state or notify backend.
    console.log(`Change permission for ${id} to ${newPermission}`);
  };

  return (
    <Dialog open={true} onClose={closeModal}>
      <DialogTitle>Collaborators</DialogTitle>
      <DialogContent>
        <List>
          {collaborators.map(collab => (
            <ListItem key={collab.id}>
              <ListItemText primary={collab.name} />
              <FormControl variant="standard" sx={{ minWidth: 100 }}>
                <Select
                  value={collab.permission}
                  onChange={(e) => handlePermissionChange(collab.id, e.target.value)}
                >
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="edit">Edit</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CollaborationModal;
