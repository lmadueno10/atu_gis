import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { Box, IconButton, Paper, Slide, Tooltip, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import CustomControl from "../CustomControl/CustomControl";

const CustomPaper = styled(Paper)({
    padding: 10,
    width: 500,
    maxHeight: "calc(100vh - 120px)",
    overflowY: "auto",
});

export default function CustomControlIcon({ title = "", position = "topright", children }) {
    const [showPaper, setShowPaper] = useState(false);

    const handleButtonClick = () => {
        setShowPaper(!showPaper);
    };

    return (
        <CustomControl position={position}>
            <Box>
                {!showPaper && (
                    <Tooltip
                        title="Delete"
                        placement="left"
                        PopperProps={{
                            modifiers: [
                                {
                                    name: "offset",
                                    options: {
                                        offset: [0, -14],
                                    },
                                },
                            ],
                        }}
                    >
                        <IconButton size="large" color="secondary" onClick={handleButtonClick}>
                            <MenuIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                )}
                <Slide direction="left" in={showPaper} mountOnEnter unmountOnExit>
                    <CustomPaper elevation={3}>
                        <Box display="flex" alignItems="center">
                            <Typography variant="h6">{title}</Typography>
                            <IconButton onClick={handleButtonClick} sx={{ marginLeft: "auto" }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        {children}
                    </CustomPaper>
                </Slide>
            </Box>
        </CustomControl>
    );
}
