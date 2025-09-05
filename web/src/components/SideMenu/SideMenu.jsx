import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate } from 'react-router-dom';

function SideMenu() {
    const navigate = useNavigate();

    return (
        <Box sx={{ width: 250, bgcolor: 'background.paper' }}>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/texto')}>
                        <ListItemIcon>
                            <TextFieldsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Texto" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/archivo')}>
                        <ListItemIcon>
                            <FolderIcon />
                        </ListItemIcon>
                        <ListItemText primary="Archivo" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
}

export default SideMenu;