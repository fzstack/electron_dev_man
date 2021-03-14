import React, { useEffect, useRef, useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import {
  AppBar,
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TuneIcon from '@material-ui/icons/Tune';
import { observer, inject } from 'mobx-react';
import { Device, DeviceStore } from '@/store';
import { autorun } from 'mobx';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import FiberManualRecordTwoToneIcon from '@material-ui/icons/FiberManualRecordTwoTone';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary">
      {'Copyright © '}
      <Link color="inherit" href="https://www.fzstack.com/">
        福州堆栈科技有限公司
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}

const drawerWidth = '30vw';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    //overflow: 'hidden',
  },
  main: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    flex: '1',
    height: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  table: {
    marginBottom: theme.spacing(2),
  },
  footer: {
    padding: theme.spacing(3, 2),
    marginTop: 'auto',
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[200]
        : theme.palette.grey[800],
  },
  appbar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: drawerWidth,
  },
  drawerPaper: {
    width: drawerWidth,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  textField: {
    flex: '1'
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
  },
  sideHolder: {
    display: 'flex',
    flexDirection: 'row',
    flex: '1',
  },
  msgList: {
    flex: 1,
    //maxHeight: 100,
    overflow: 'auto',
    //overflowX: 'hidden',
    width: '100%',
  },
  msgListHeader: {
    background: 'rgba(255,255,255,0.9)',
  },
  inline: {
    wordWrap: 'break-word',
    wordBreak: 'break-all',
  },
  footerRow: {
    //width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  configMenu: {
    width: '170px',
  },
  footerRight: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  footerStatus: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 2,
    color: '#7cb342',
  },
  statusBadget: ({isOnline}: {isOnline: boolean}) => ({
    transform: 'translate(4px, -1px) scale(0.8, 0.8)',
    backgroundColor: isOnline ? "#7cb342" : "#d32f2f",
    //border: `1px solid ${theme.palette.primary.main}`,
    //padding: '2px 2px',
  })
}));

function nullComp<T>(a: T | undefined, b: T | undefined, comp: (a: T, b: T) => number): number {
  if(a != null && b != null) {
    return comp(a, b);
  } else if(a != null && b == null) {
    return 1;
  } else if(a == null && b != null) {
    return -1;
  } else {
    return 0;
  }
}

function gComp<T>(a: T, b: T): number {
  return a == b ? 0 : (a < b ? -1 : 1);
}

type pos = {
  x: number | null,
  y: number | null,
}

const defualtPos: pos = {
  x: null,
  y: null,
};

function DeviceRow({device}: {device: Device}) {
  const { enqueueSnackbar } = useSnackbar();
  const [currPos, setCurrPos] = useState<pos>(defualtPos);
  const rootRef = useRef<HTMLTableRowElement>(null);



  useEffect(() => {
    device.on('auth', () => {
      enqueueSnackbar(`设备${device.id}授权成功`, {
        variant: 'success',
        anchorOrigin: {vertical: 'bottom', horizontal: 'right'},
      });
    })
    rootRef.current?.addEventListener('contextmenu', e => {
      e.preventDefault();
      setCurrPos({
        x: e.clientX - 2,
        y: e.clientY - 4,
      })
    });
  }, []);

  const [isUploadDurOpen, setIsUploadDurOpen] = useState<boolean>(false);
  const [uploadDur, setUploadDur] = useState<string>('0');

  const [isMoniTimeOpen, setIsMoniTimeOpen] = useState<boolean>(false);
  const [moniTime0, setMoniTime0] = useState<string>('0');
  const [moniTime1, setMoniTime1] = useState<string>('0');
  const [moniTime2, setMoniTime2] = useState<string>('0');
  const [moniTime3, setMoniTime3] = useState<string>('0');
  const [moniTime4, setMoniTime4] = useState<string>('0');

  const authTimeStr = device.authTime == null ? null : moment(device.authTime).format('YYYY/MM/DD HH:mm:ss');

  const closeMenuAfter = <F extends (...args: any) => any>(f: F) => (...args: any) => {
    const result = f(args);
    setCurrPos(defualtPos);
    return result;
  }

  return (
    <>
      <TableRow hover ref={rootRef} style={{
        cursor: 'context-menu',
      }}>
        <TableCell  align='center' component="th" scope="row">
          {device.sn}
        </TableCell>
        <TableCell align='center'> {device.id}</TableCell>
        <TableCell align='center'>{device.gateway}</TableCell>
        <TableCell align='center'>{JSON.stringify(device.value) ?? '-'}</TableCell>
        <TableCell align='center'>{device.authState ? "已授权" : "未授权"}</TableCell>
        <TableCell align='center'>{authTimeStr ?? '-'}</TableCell>
      </TableRow>
      <Menu
        anchorReference="anchorPosition"
        anchorPosition={currPos.x != null && currPos.y != null ? {
          top: currPos.y,
          left: currPos.x,
        } : undefined}
        open={currPos.y != null}
        onClose={() => {
          setCurrPos(defualtPos);
        }}
      >
        <MenuItem dense disabled>
          {device.id} - 命令
        </MenuItem>
        <MenuItem onClick={closeMenuAfter(() => {
          device.reset();
        })}>复位初值</MenuItem>
        <MenuItem onClick={closeMenuAfter(() => {
          device.sample();
        })}>实时采集</MenuItem>
        <MenuItem onClick={closeMenuAfter(() => {
          device.factory();
        })}>恢复出厂设置</MenuItem>
        <MenuItem onClick={closeMenuAfter(() => {
          setIsUploadDurOpen(true);
        })}>设置上报时间</MenuItem>
        <MenuItem onClick={closeMenuAfter(() => {
          setIsMoniTimeOpen(true);
        })}>设置监测等级</MenuItem>
      </Menu>
      <Dialog open={isUploadDurOpen} onClose={() => {
        setIsUploadDurOpen(false);
      }}>
        <DialogTitle>
        设置上报时间
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="上报周期(s)"
            type="number"
            fullWidth
            value={uploadDur}
            onChange={e => {
              setUploadDur(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button>
            取消
          </Button>
          <Button color='primary' type="submit" onClick={async () => {
            await device.setUploadDuration(parseInt(uploadDur));
            setIsUploadDurOpen(false);
          }}>
            提交
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isMoniTimeOpen} onClose={() => {
        setIsMoniTimeOpen(false);
      }}>
        <DialogTitle>
        设置监测等级
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="等级0(s)"
            type="number"
            fullWidth
            value={moniTime0}
            onChange={e => {
              setMoniTime0(e.target.value);
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="等级1(s)"
            type="number"
            fullWidth
            value={moniTime1}
            onChange={e => {
              setMoniTime1(e.target.value);
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="等级2(s)"
            type="number"
            fullWidth
            value={moniTime2}
            onChange={e => {
              setMoniTime2(e.target.value);
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="等级3(s)"
            type="number"
            fullWidth
            value={moniTime3}
            onChange={e => {
              setMoniTime3(e.target.value);
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="等级4(s)"
            type="number"
            fullWidth
            value={moniTime4}
            onChange={e => {
              setMoniTime4(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button>
            取消
          </Button>
          <Button color='primary' type="submit" onClick={async () => {
            //await device.setUploadDuration(parseInt(uploadDur));
            //setIsUploadDurOpen(false);
            await device.setMoniTime([parseInt(moniTime0), parseInt(moniTime1), parseInt(moniTime2), parseInt(moniTime3), parseInt(moniTime4)]);
            setIsMoniTimeOpen(false);
          }}>
            提交
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default inject("deviceStore")(observer(({deviceStore}: {deviceStore: DeviceStore}) => {
  const classes = useStyles({isOnline: false});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    autorun(() => {
      const len = deviceStore.origins.length;
      const curr = listRef.current;
      if(curr == null) return;
      if(curr.scrollTop + curr.clientHeight + 200 >= curr.scrollHeight) {
        curr.scrollTop = curr.scrollHeight;
      }

    });
  }, []);

  const configMenu = (
    <Menu
      anchorEl={anchorEl}
      classes={{
        list: classes.configMenu,
      }}
      keepMounted
      open={isMenuOpen}
      onClose={() => {
        setAnchorEl(null);
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      getContentAnchorEl={null}
    >
      <MenuItem>
        <ListItemText primary="自动授权" />
        <ListItemSecondaryAction>
          <Switch checked={deviceStore.autoAuth} onChange={e => {
            deviceStore.setAutoAuth(e.target.checked);
          }}/>
        </ListItemSecondaryAction>
      </MenuItem>
    </Menu>
  );



  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="static" className={classes.appbar}>
        <Toolbar variant='dense' className={classes.toolbar}>
          <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
            >
              <Badge variant="dot" classes={{
                badge: classes.statusBadget,
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              >
                <AccountCircleIcon />
              </Badge>
          </IconButton>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={e => {
              setAnchorEl(e.currentTarget);
            }}
          >
            <TuneIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant='persistent'
        anchor='left'
        open
        className={classes.drawer}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar />
        <List ref={listRef} subheader={<ListSubheader className={classes.msgListHeader}>MQTT消息</ListSubheader>} className={classes.msgList}>
          {
            deviceStore.origins.map(msg =>
              <ListItem key={msg.id} button dense>
                <ListItemText primary={msg.topic} secondary={
                  <>
                    <Typography component="span" variant='body2' className={classes.inline}>
                      {msg.payload}
                    </Typography>
                  </>
                }/>
              </ListItem>
            )
          }
        </List>
      </Drawer>
      <div className={classes.sideHolder}>
        <div className={classes.drawer}/>
        <div className={classes.content}>
          <Container component="main" maxWidth="md" className={classes.main}>
            <TableContainer component={Paper} className={classes.table}>
              <Table aria-label="simple table" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>序列号</TableCell>
                    <TableCell align='center'>设备号</TableCell>
                    <TableCell align='center'>网关</TableCell>
                    <TableCell align='center'>当前值</TableCell>
                    <TableCell align='center'>授权状态</TableCell>
                    <TableCell align='center'>授权时间</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deviceStore.devices.slice().sort((a, b) => {
                    const idOrder = nullComp(a.id, b.id, gComp);
                    const gatewayOrder = nullComp(a.gateway, b.gateway, gComp);
                    if(gatewayOrder != 0)
                      return gatewayOrder;
                    return idOrder;
                  }).map((device) => (
                    <DeviceRow key={device.id} device={device} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
          <footer className={classes.footer}>
            <Container maxWidth="md" className={classes.footerRow}>
              <div>
                <Typography variant="body1">
                  福建省地质工程勘察院
                </Typography>
                <Typography variant="body1">
                  自然资源部丘陵山地地质灾害防治重点实验室
                </Typography>
                <Copyright />
              </div>
              <div className={classes.footerRight}>
                <Typography variant="body2" className={classes.footerStatus}>
                  <FiberManualRecordTwoToneIcon className={classes.statusIcon}/>
                  在线
                </Typography>
              </div>
            </Container>
          </footer>
          {configMenu}
        </div>
      </div>
    </div>
  );
}))
