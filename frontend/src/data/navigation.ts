import { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
  { label: 'Agents', href: '/projects' },
  { label: '3D Model', href: '/vibrant' },
  { label: 'Platform Vision', href: '/about-us' },
  { label: 'Core Features', href: '/projects' },
  { label: 'Contact', href: '#contact' },
];

export const projectNavItems: NavItem[] = [
  { label: '🗺️ WHO Outbreak & Surveillance Map', href: '/orchestrator-agent?tab=hospital', badge: 'Live GIS Map' },
  { label: '⌚ Google & Apple Health Sync', href: '/orchestrator-agent?tab=sync', badge: 'New' },
  { label: '⚡ Sanjeevni-OS Orchestrator', href: '/orchestrator-agent', badge: 'Active' },
  { label: '🩺 Symptom Triage & Analysis', href: '/orchestrator-agent?tab=swarm', badge: 'Active' },
  { label: '🔬 Medical Scan Agent (YOLOv8)', href: '/orchestrator-agent?tab=scan', badge: 'Active' },
  { label: '🫀 3D Body Digital Twin', href: '/vibrant', badge: '3D Live' },
  { label: '🥗 Nutrition & Fitness AI', href: '/projects/nutrition-fitness-assistant', badge: 'Active' },
  { label: '🔐 ABHA & Blockchain Records', href: '/orchestrator-agent?tab=records', badge: 'Active' },
];

export const legalNavItems: NavItem[] = [
  { label: 'Legal Notice', href: '/legal-notice' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
];
