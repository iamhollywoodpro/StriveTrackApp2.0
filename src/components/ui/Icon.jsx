import React from 'react';
import { 
  Plus, X, Target, Calendar, BarChart3, Search, AlertCircle, 
  Check, Trash2, Star, Camera, TrendingUp, ArrowLeftRight,
  Upload, Scan, ChevronDown, ChevronUp, Edit2, Share2,
  Settings, User, Home, Activity, Book, Trophy,
  Clock, Heart, Zap, Award, Users, MessageCircle,
  Bell, Filter, Download, Eye, EyeOff, Lock, Unlock,
  Mail, Phone, MapPin, Calendar as CalendarIcon,
  File, Image, Video, Music, Archive, Bookmark,
  Copy, Undo, Redo, Save,
  RefreshCw, Loader, CheckCircle, XCircle, Info,
  Menu, MoreHorizontal, MoreVertical, Grid, List,
  Maximize, Minimize, Volume2, VolumeX, Play, Pause,
  SkipBack, SkipForward, FastForward, Rewind,
  Wifi, WifiOff, Battery, BatteryLow, Signal,
  Bluetooth, Headphones, Mic, MicOff, Speaker
} from 'lucide-react';

const IconMap = {
  // Basic actions
  Plus, X, Search, Filter, Settings, Menu, Home,
  Edit2, Share2, Copy, Save, Download,
  Upload, RefreshCw, Undo, Redo,
  
  // Navigation & Layout
  ChevronDown, ChevronUp, MoreHorizontal, MoreVertical,
  Grid, List, Maximize, Minimize, ArrowLeftRight,
  
  // Status & Feedback
  Check, CheckCircle, XCircle, AlertCircle, Info,
  Star, Heart, Award, Trophy, Target, Zap,
  Loader, Bell, Eye, EyeOff, Lock, Unlock,
  
  // Content & Media
  Camera, Image, Video, Music, File, Archive,
  Book, Bookmark, Calendar, CalendarIcon,
  
  // User & Social
  User, Users, MessageCircle, Mail, Phone,
  MapPin, Activity, TrendingUp,
  
  // Fitness specific
  Target, BarChart3, Calendar, Clock,
  
  // Media controls
  Play, Pause, SkipBack, SkipForward,
  FastForward, Rewind, Volume2, VolumeX,
  
  // Connectivity
  Wifi, WifiOff, Battery, BatteryLow, Signal,
  Bluetooth, Headphones, Mic, MicOff, Speaker,
  
  // Utility
  Trash2, Scan
};

const Icon = ({ name, size = 24, className = '', color, ...props }) => {
  const IconComponent = IconMap?.[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in IconMap. Available icons:`, Object.keys(IconMap));
    return <div className={`inline-block w-${Math.floor(size/4)} h-${Math.floor(size/4)} ${className}`} {...props} />;
  }
  
  const iconStyle = color ? { color } : {};
  
  return (
    <IconComponent 
      size={size} 
      className={className}
      style={iconStyle}
      {...props} 
    />
  );
};

export default Icon;