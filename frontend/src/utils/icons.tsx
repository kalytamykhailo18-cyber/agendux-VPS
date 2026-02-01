import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import StarIcon from '@mui/icons-material/Star';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Icon mapping utility for CMS features
const iconMap: Record<string, React.ComponentType<{ sx?: object }>> = {
  AccessTime: AccessTimeIcon,
  AttachMoney: AttachMoneyIcon,
  QrCode2: QrCode2Icon,
  Star: StarIcon,
  CalendarMonth: CalendarMonthIcon,
  Autorenew: AutorenewIcon,
  CheckCircle: CheckCircleIcon,
  Notifications: NotificationsIcon,
  Security: SecurityIcon,
  Speed: SpeedIcon,
  Support: SupportAgentIcon,
  TrendingUp: TrendingUpIcon,
};

// Color mapping for icons
const iconColors: Record<string, string> = {
  AccessTime: 'bg-blue-100 text-blue-600',
  AttachMoney: 'bg-green-100 text-green-600',
  QrCode2: 'bg-purple-100 text-purple-600',
  Star: 'bg-yellow-100 text-yellow-600',
  CalendarMonth: 'bg-indigo-100 text-indigo-600',
  Autorenew: 'bg-cyan-100 text-cyan-600',
  CheckCircle: 'bg-emerald-100 text-emerald-600',
  Notifications: 'bg-orange-100 text-orange-600',
  Security: 'bg-red-100 text-red-600',
  Speed: 'bg-pink-100 text-pink-600',
  Support: 'bg-teal-100 text-teal-600',
  TrendingUp: 'bg-lime-100 text-lime-600',
};

export function getIconComponent(iconName: string, size: number = 28) {
  const IconComponent = iconMap[iconName] || StarIcon;
  return <IconComponent sx={{ fontSize: size }} />;
}

export function getIconBgColor(iconName: string): string {
  return iconColors[iconName] || 'bg-gray-100 text-gray-600';
}

export const availableIcons = Object.keys(iconMap);
