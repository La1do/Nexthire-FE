// Danh sách icon dùng cho element icon (curated từ lucide-react).
// Giữ nhỏ gọn, tập trung vào icon hay dùng trên CV.
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  Heart,
  Languages,
  Code,
  Send,
  Link as LinkIcon,
  AtSign,
  Share2,
  MessageCircle,
  Building2,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from 'lucide-react';

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  mail: Mail,
  phone: Phone,
  'map-pin': MapPin,
  globe: Globe,
  'at-sign': AtSign,
  share: Share2,
  message: MessageCircle,
  calendar: Calendar,
  user: User,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  award: Award,
  star: Star,
  heart: Heart,
  languages: Languages,
  code: Code,
  send: Send,
  link: LinkIcon,
  building: Building2,
  check: CheckCircle2,
  circle: Circle,
};

export const ICON_NAMES = Object.keys(ICON_REGISTRY);

export const getIcon = (name: string): LucideIcon =>
  ICON_REGISTRY[name] ?? Circle;
