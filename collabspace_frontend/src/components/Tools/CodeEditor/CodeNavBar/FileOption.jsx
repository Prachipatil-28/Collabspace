import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, IconButton, TextField, Box } from '@mui/material';
import { InsertDriveFile, Edit, Delete, Add } from '@mui/icons-material';

const FileExplorer = () => {
  const [files, setFiles] = useState(() => {
    // Try to load saved files from localStorage
    const saved = localStorage.getItem('files');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'main.js', content: '// initial code' },
      { id: 2, name: 'helper.js', content: '// helper code' },
    ];
  });
  const [editingFileId, setEditingFileId] = useState(null);
  const [editedName, setEditedName] = useState('');

  // Listen for external "newFile" events from the navbar.
  useEffect(() => {
    const handleNewFileEvent = () => addFile();
    window.addEventListener('newFile', handleNewFileEvent);
    return () => window.removeEventListener('newFile', handleNewFileEvent);
  }, [files]);

  const addFile = () => {
    const newFile = { id: Date.now(), name: 'untitled.js', content: '' };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setEditingFileId(newFile.id);
    setEditedName(newFile.name);
    localStorage.setItem('files', JSON.stringify(updatedFiles));
  };

  const handleEditClick = (file) => {
    setEditingFileId(file.id);
    setEditedName(file.name);
  };

  const handleNameChange = (e) => {
    setEditedName(e.target.value);
  };

  const handleNameBlur = (file) => {
    const updatedFiles = files.map(f =>
      f.id === file.id ? { ...f, name: editedName } : f
    );
    setFiles(updatedFiles);
    setEditingFileId(null);
    localStorage.setItem('files', JSON.stringify(updatedFiles));
  };

  const handleDelete = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    localStorage.setItem('files', JSON.stringify(updatedFiles));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box component="span" sx={{ fontWeight: 'bold' }}>Files</Box>
        <IconButton size="small" onClick={addFile}>
          <Add />
        </IconButton>
      </Box>
      <List>
        {files.map(file => (
          <ListItem key={file.id} secondaryAction={
            <>
              <IconButton edge="end" onClick={() => handleEditClick(file)}>
                <Edit />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDelete(file.id)}>
                <Delete />
              </IconButton>
            </>
          }>
            <ListItemIcon>
              <InsertDriveFile />
            </ListItemIcon>
            {editingFileId === file.id ? (
              <TextField
                value={editedName}
                onChange={handleNameChange}
                onBlur={() => handleNameBlur(file)}
                variant="standard"
                autoFocus
              />
            ) : (
              <ListItemText primary={file.name} />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FileExplorer;
