import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Badge, Collapse, List } from "@material-ui/core";
//import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
//import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
//import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
//import FlashOnIcon from "@material-ui/icons/FlashOn";
//import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import EventIcon from "@material-ui/icons/Event";
//import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/ListAlt";
//import AnnouncementIcon from "@material-ui/icons/Announcement";
//import ForumIcon from "@material-ui/icons/Forum";
//import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import { CalendarToday, LoyaltyRounded } from "@material-ui/icons";
//import DialpadIcon from '@material-ui/icons/Dialpad';
//import PermContactCalendarSharpIcon from '@material-ui/icons/PermContactCalendarSharp';
//import ContactPhoneSharpIcon from '@material-ui/icons/ContactPhoneSharp';
//import SpeakerNotesSharpIcon from '@material-ui/icons/SpeakerNotesSharp';
//import DashboardSharpIcon from '@material-ui/icons/DashboardSharp';
//import LiveHelpSharpIcon from '@material-ui/icons/LiveHelpSharp';
//import AssignmentSharpIcon from '@material-ui/icons/AssignmentSharp';
//import ChatOutlinedIcon from '@material-ui/icons/ChatOutlined';
//import ContactPhoneOutlinedIcon from '@material-ui/icons/ContactPhoneOutlined';
//import AssignmentOutlinedIcon from '@material-ui/icons/AssignmentOutlined';
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined';
//import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
//import LiveHelpOutlinedIcon from '@material-ui/icons/LiveHelpOutlined';
//import AnnouncementOutlinedIcon from '@material-ui/icons/AnnouncementOutlined';
//import FeaturedPlayListOutlinedIcon from '@material-ui/icons/FeaturedPlayListOutlined';
//import InsertChartOutlinedIcon from '@material-ui/icons/InsertChartOutlined';
//import EventNoteOutlinedIcon from '@material-ui/icons/EventNoteOutlined';
import EventAvailableOutlinedIcon from '@material-ui/icons/EventAvailableOutlined';
import PieChartOutlinedIcon from '@material-ui/icons/PieChartOutlined';
import LocalPhoneOutlinedIcon from '@material-ui/icons/LocalPhoneOutlined';
import ContactlessOutlinedIcon from '@material-ui/icons/ContactlessOutlined';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import ExploreOutlinedIcon from '@material-ui/icons/ExploreOutlined';
import FlipCameraAndroidOutlinedIcon from '@material-ui/icons/FlipCameraAndroidOutlined';
//import NotificationImportantOutlinedIcon from '@material-ui/icons/NotificationImportantOutlined';
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined';
import WrapTextOutlinedIcon from '@material-ui/icons/WrapTextOutlined';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import OfflineBoltOutlinedIcon from '@material-ui/icons/OfflineBoltOutlined';
import VolumeUpOutlinedIcon from '@material-ui/icons/VolumeUpOutlined';


import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { socketConnection } from "../services/socket";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";

function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink} className={className}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const history = useHistory();

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [openKanbanSubmenu, setOpenKanbanSubmenu] = useState(false);
  
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => (
          <ListItemLink
            to="/"
            primary="Dashboard"
            icon={<PieChartOutlinedIcon />}
          />
        )}
      />

      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsAppIcon />}
      />

     <ListItemLink
        to="/todolist"
        primary={i18n.t("mainDrawer.listItems.todolist")}
        icon={<EventIcon />}
      />

      <ListItem
        button
        onClick={() => setOpenKanbanSubmenu((prev) => !prev)}
      >
        <ListItemIcon>
          <LoyaltyRounded />
        </ListItemIcon>
        <ListItemText
          primary={i18n.t("mainDrawer.listItems.kanban")}
        />
        {openKanbanSubmenu ? (
          <ExpandLessIcon />
        ) : (
          <ExpandMoreIcon />
        )}
      </ListItem>
      <Collapse
        style={{ paddingLeft: 15 }}
        in={openKanbanSubmenu}
        timeout="auto"
        unmountOnExit
      >
        <List component="div" disablePadding>
          <ListItem onClick={() => history.push("/kanban")} button>
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t("kanban.subMenus.list")} />
          </ListItem>
          <ListItem
            onClick={() => history.push("/tagsKanban")}
            button
          >
            <ListItemIcon>
              <CalendarToday />
            </ListItemIcon>
            <ListItemText primary={i18n.t("kanban.subMenus.tags")} />
          </ListItem>
        </List>
      </Collapse>

      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<OfflineBoltOutlinedIcon />}
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<LocalPhoneOutlinedIcon />}
      />

      <ListItemLink
        to="/schedules"
        primary={i18n.t("mainDrawer.listItems.schedules")}
        icon={<EventAvailableOutlinedIcon />}
      />
      
      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<LocalOfferOutlinedIcon />}
      />

      <ListItemLink
        to="/chats"
        primary={i18n.t("mainDrawer.listItems.chats")}
        icon={
          <Badge color="secondary" variant="dot" invisible={invisible}>
            <FlipCameraAndroidOutlinedIcon />
          </Badge>
        }
      />

      <ListItemLink
        to="/helps"
        primary={i18n.t("mainDrawer.listItems.helps")}
        icon={<HelpOutlineOutlinedIcon />}
      />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            {showCampaigns && (
              <>
                  <ListItem
                  button
                  onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                >
                  <ListItemIcon>
                    <EventAvailableIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={i18n.t("mainDrawer.listItems.campaigns")}
                  />
                  {openCampaignSubmenu ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
                <Collapse
                  style={{ paddingLeft: 15 }}
                  in={openCampaignSubmenu}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItem onClick={() => history.push("/campaigns")} button>
                      <ListItemIcon>
                        <ListIcon />
                      </ListItemIcon>
                      <ListItemText primary="Listagem" />
                    </ListItem>
                    <ListItem
                      onClick={() => history.push("/contact-lists")}
                      button
                    >
                      <ListItemIcon>
                        <PeopleIcon />
                      </ListItemIcon>
                      <ListItemText primary="Listas de Contatos" />
                    </ListItem>
                    <ListItem
                      onClick={() => history.push("/campaigns-config")}
                      button
                    >
                      <ListItemIcon>
                        <SettingsOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary="Configurações" />
                    </ListItem>
                  </List>
                </Collapse>
              </>
            )}
            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<ErrorOutlineOutlinedIcon />}
              />
            )}
            <ListItemLink
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  <ContactlessOutlinedIcon />
                </Badge>
              }
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<WrapTextOutlinedIcon />}
            />
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlinedIcon />}
            />
            <ListItemLink
              to="/messages-api"
              primary={i18n.t("mainDrawer.listItems.messagesAPI")}
              icon={<CodeRoundedIcon />}
            />
              <ListItemLink
                to="/financeiro"
                primary={i18n.t("mainDrawer.listItems.financeiro")}
                icon={<MonetizationOnOutlinedIcon />}
              />
            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlinedIcon />}
            />
{/*             <ListItemLink
              to="/subscription"
              primary="Assinatura"
              icon={<PaymentIcon />}
              //className={classes.menuItem}
            /> */}
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;