import React from "react";
import {
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    Divider,
    useTheme,
} from "@mui/material";
import {
    ExpandLess,
    ExpandMore,
    Map,
    Notifications,
    Assessment,
    DirectionsBus,
    Report,
    Business,
    Settings,
    Info,
    LocationOn,
    Traffic,
    LocalShipping,
} from "@mui/icons-material";

const defaultItems = [
    {
        label: "Mapa",
        icon: <Map fontSize="small" sx={{ color: "primary.main" }} />,
        children: [
            {
                label: "Tiempo Real",
                icon: <LocationOn fontSize="small" sx={{ color: "secondary.main" }} />,
                children: [
                    {
                        label: "Buses Activos",
                        icon: <DirectionsBus fontSize="small" sx={{ color: "secondary.main" }} />,
                    },
                    {
                        label: "Rutas y Paradas",
                        icon: <Traffic fontSize="small" sx={{ color: "secondary.main" }} />,
                    },
                ],
            },
            {
                label: "Histórico",
                icon: <LocationOn fontSize="small" sx={{ color: "secondary.main" }} />,
            },
        ],
    },
    {
        label: "Alertas",
        icon: <Notifications fontSize="small" sx={{ color: "error.main" }} />,
        children: [
            {
                label: "Alertas Activas",
                icon: <Notifications fontSize="small" sx={{ color: "error.main" }} />,
            },
            {
                label: "Historial de Alertas",
                icon: <Notifications fontSize="small" sx={{ color: "error.main" }} />,
            },
        ],
    },
    {
        label: "Reportes",
        icon: <Assessment fontSize="small" sx={{ color: "success.main" }} />,
        children: [
            {
                label: "Generar Reporte",
                icon: <Report fontSize="small" sx={{ color: "success.main" }} />,
            },
            {
                label: "Historial de Reportes",
                icon: <Report fontSize="small" sx={{ color: "success.main" }} />,
            },
        ],
    },
    {
        label: "Empresas de Transporte",
        icon: <Business fontSize="small" sx={{ color: "info.main" }} />,
        children: [
            {
                label: "Lista de Empresas",
                icon: <LocalShipping fontSize="small" sx={{ color: "info.main" }} />,
            },
            {
                label: "Detalles de Empresa",
                icon: <Business fontSize="small" sx={{ color: "info.main" }} />,
            },
        ],
    },
    {
        label: "Empresas de Monitoreo Vehicular",
        icon: <Business fontSize="small" sx={{ color: "info.main" }} />,
        children: [
            {
                label: "Lista de Empresas",
                icon: <LocalShipping fontSize="small" sx={{ color: "info.main" }} />,
            },
            {
                label: "Detalles de Empresa",
                icon: <Business fontSize="small" sx={{ color: "info.main" }} />,
            },
        ],
    },
    {
        label: "Configuración",
        icon: <Settings fontSize="small" sx={{ color: "warning.main" }} />,
        children: [
            {
                label: "Usuarios",
                icon: <Settings fontSize="small" sx={{ color: "warning.main" }} />,
            },
            {
                label: "Preferencias del Sistema",
                icon: <Settings fontSize="small" sx={{ color: "warning.main" }} />,
            },
        ],
    },
    {
        label: "Información",
        icon: <Info fontSize="small" sx={{ color: "text.secondary" }} />,
        children: [
            {
                label: "Acerca de",
                icon: <Info fontSize="small" sx={{ color: "text.secondary" }} />,
            },
            {
                label: "Soporte",
                icon: <Info fontSize="small" sx={{ color: "text.secondary" }} />,
            },
        ],
    },
];

export default function MultiLevelMenu({ items = defaultItems }) {
    const [open, setOpen] = React.useState({});
    const theme = useTheme();

    const handleClick = (key) => {
        setOpen((prevOpen) => ({
            ...prevOpen,
            [key]: !prevOpen[key],
        }));
    };

    const renderList = (items, parentKey = "", level = 0) => {
        return (
            <List component="div" disablePadding>
                {items.map((item, index) => {
                    const key = parentKey ? `${parentKey}-${index}` : `${index}`;
                    const hasChildren = item.children && item.children.length > 0;
                    const paddingLeft = level === 0 ? 10 : level * 20;

                    return (
                        <React.Fragment key={key}>
                            <ListItem
                                button
                                onClick={() => handleClick(key)}
                                style={{
                                    paddingLeft,
                                    backgroundColor: open[key]
                                        ? theme.palette.action.selected
                                        : "inherit",
                                    transition: "background-color 0.3s",
                                }}
                            >
                                {item.icon && (
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 36,
                                            color: open[key]
                                                ? theme.palette.primary.main
                                                : "inherit",
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                )}
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: 14 }}
                                />
                                {hasChildren ? open[key] ? <ExpandLess /> : <ExpandMore /> : null}
                            </ListItem>
                            {hasChildren && (
                                <Collapse in={open[key]} timeout="auto" unmountOnExit>
                                    {renderList(item.children, key, level + 1)}
                                </Collapse>
                            )}
                            {index < items.length - 1 && level === 0 && <Divider />}{" "}
                            {/* Dividers solo en el primer nivel */}
                        </React.Fragment>
                    );
                })}
            </List>
        );
    };

    return <div>{renderList(items)}</div>;
}
