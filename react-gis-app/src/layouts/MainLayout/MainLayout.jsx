import { Box } from "@mui/material";
import Header from "../../components/Header/Header";
import MultiLevelMenu from "../../components/MultiLevelMenu/MultiLevelMenu";

export default function MainLayout({ children }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />
            <Box display="flex" flexGrow={1}>
                <Box width={300} mx={1} mt={1}>
                    <MultiLevelMenu />
                </Box>
                {children}
            </Box>
        </Box>
    );
}
