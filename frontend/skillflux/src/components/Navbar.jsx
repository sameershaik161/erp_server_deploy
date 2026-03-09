import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, Chip, Divider } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as MenuIcon, X, Trophy, User, BarChart3, FileText, LogOut, Home, Plus, Settings, Shield, Megaphone } from "lucide-react";
import vignanLogo from "../assets/logo.jpg";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const studentLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/announcements", label: "Announcements", icon: Megaphone, badge: "New" },
    { to: "/update-erp", label: "ERP", icon: FileText },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: Home },
    { to: "/admin/manage", label: "Achievements", icon: Trophy },
    { to: "/admin/manage-erp", label: "ERPs", icon: FileText },
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const links = user?.role === "admin" ? adminLinks : studentLinks;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: '#6366F1',
        borderBottom: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
        {/* Logo Section */}
        <Box className="flex items-center space-x-2">
          <Box
            component="img"
            src={vignanLogo}
            alt="Vignan's Logo"
            sx={{
              height: 40,
              width: 'auto',
              objectFit: 'contain',
              backgroundColor: 'white',
              padding: 0.5,
              borderRadius: '6px',
              marginLeft: '-10px',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          />
          <Typography
            variant="h6"
            className="font-semibold text-white"
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontFamily: 'Inter',
              fontSize: '1.125rem',
              fontWeight: 600
            }}
          >
            Vignan's Student ERP Portal
          </Typography>
          <Typography
            variant="h6"
            className="font-bold text-white"
            sx={{
              display: { xs: 'block', sm: 'none' },
              fontSize: '1.1rem'
            }}
          >
            VSAP
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <motion.div
                    key={link.to}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      component={Link}
                      to={link.to}
                      sx={{
                        px: 2.5,
                        py: 1,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: 'white',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                      startIcon={<Icon className="w-4 h-4" />}
                      endIcon={link.badge && (
                        <Chip
                          label={link.badge}
                          size="small"
                          className="ml-1 bg-yellow-400 text-gray-900 font-bold"
                          sx={{ height: 18, fontSize: '0.65rem' }}
                        />
                      )}
                    >
                      {link.label}
                    </Button>
                  </motion.div>
                );
              })}

              <Divider orientation="vertical" flexItem className="bg-white/20 mx-2" />

              {/* User Menu */}
              <Box className="flex items-center space-x-3">
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  className="p-0"
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      backgroundColor: '#4F46E5',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {user.name?.[0] || user.username?.[0] || 'U'}
                  </Avatar>
                </IconButton>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  className: 'mt-2 backdrop-blur-xl bg-white/95 rounded-xl',
                  sx: {
                    minWidth: 200,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                  }
                }}
              >
                <Box className="px-4 py-3 border-b border-gray-200">
                  <Typography className="font-semibold text-gray-900">
                    {user.name || user.username}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    {user.role === 'admin' ? 'Administrator' : user.rollNumber}
                  </Typography>
                </Box>
                <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                  <User className="w-4 h-4 mr-3" /> Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/settings'); setAnchorEl(null); }}>
                  <Settings className="w-4 h-4 mr-3" /> Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-3" /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box className="flex items-center space-x-2">
              <Button
                component={Link}
                to="/login"
                className="text-white hover:bg-white/10 px-4 py-2 rounded-xl"
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-xl font-semibold"
              >
                Register
              </Button>
            </Box>
          )}
        </Box>

        {/* Mobile Menu Icon */}
        <IconButton
          className="text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          {mobileOpen ? <X /> : <MenuIcon />}
        </IconButton>
      </Toolbar>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Box className="bg-gradient-to-b from-purple-600/50 to-purple-700/50 backdrop-blur-xl border-t border-white/10 px-4 py-3">
              {user ? (
                <>
                  <Box className="mb-3 pb-3 border-b border-white/20">
                    <Typography className="text-white/70 text-sm">Logged in as</Typography>
                    <Typography className="text-white font-semibold">
                      {user.name || user.username}
                    </Typography>
                  </Box>

                  {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.to;
                    return (
                      <motion.div
                        key={link.to}
                        whileHover={{ x: 10 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          component={Link}
                          to={link.to}
                          fullWidth
                          className={`justify-start mb-1 px-4 py-3 rounded-xl ${isActive
                              ? 'bg-white/20 text-white'
                              : 'text-white/80 hover:bg-white/10'
                            }`}
                          startIcon={<Icon className="w-5 h-5" />}
                          onClick={() => setMobileOpen(false)}
                        >
                          {link.label}
                          {link.badge && (
                            <Chip
                              label={link.badge}
                              size="small"
                              className="ml-auto bg-yellow-400 text-gray-900"
                            />
                          )}
                        </Button>
                      </motion.div>
                    );
                  })}

                  <Divider className="my-3 bg-white/20" />

                  <Button
                    fullWidth
                    onClick={handleLogout}
                    className="text-white bg-red-500/20 hover:bg-red-500/30 px-4 py-3 rounded-xl"
                    startIcon={<LogOut className="w-5 h-5" />}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Box className="space-y-2">
                  <Button
                    component={Link}
                    to="/login"
                    fullWidth
                    className="text-white hover:bg-white/10 px-4 py-3 rounded-xl"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    fullWidth
                    variant="contained"
                    className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-3 rounded-xl font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </AppBar>
  );
}
