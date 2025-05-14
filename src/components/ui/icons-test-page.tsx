import React from "react";
import {
  // Navigation/Layout
  Menu, User, LogOut, Settings, Box, Layers, Zap, 
  // Alerts/Status
  AlertCircle, AlertTriangle, CheckCircle, XCircle, Clock, Loader2, CheckCircle2, Circle,
  // Actions
  Edit, Edit2, Trash, Trash2, Download, Upload, Copy, Check, X, Plus, Search, ChevronDown, ChevronUp,
  // Authentication/Security
  Shield, ShieldAlert, ShieldCheck, KeyRound, Eye, EyeOff,
  // Communication
  Mail, MailCheck, MailWarning, Twitter, Linkedin, Facebook, Link,
  // User/Profile
  UserPlus, UserCircle, Users, Camera, Building, Globe,
  // Devices
  Smartphone, CreditCard, QrCode,
  // Misc
  Calendar, Moon, Sun, Rocket, ArrowRight, Bell, BadgePercent
} from "lucide-react";

/**
 * This component displays all the lucide-react icons used throughout the application
 * for visual verification after upgrading the package.
 */
export default function IconsTestPage() {
  const iconGroups = [
    {
      name: "Navigation & Layout",
      icons: [
        { name: "Menu", component: <Menu /> },
        { name: "User", component: <User /> },
        { name: "LogOut", component: <LogOut /> },
        { name: "Settings", component: <Settings /> },
        { name: "Box", component: <Box /> },
        { name: "Layers", component: <Layers /> },
        { name: "Zap", component: <Zap /> },
      ],
    },
    {
      name: "Alerts & Status",
      icons: [
        { name: "AlertCircle", component: <AlertCircle /> },
        { name: "AlertTriangle", component: <AlertTriangle /> },
        { name: "CheckCircle", component: <CheckCircle /> },
        { name: "XCircle", component: <XCircle /> },
        { name: "Clock", component: <Clock /> },
        { name: "Loader2", component: <Loader2 /> },
        { name: "CheckCircle2", component: <CheckCircle2 /> },
        { name: "Circle", component: <Circle /> },
      ],
    },
    {
      name: "Actions",
      icons: [
        { name: "Edit", component: <Edit /> },
        { name: "Edit2", component: <Edit2 /> },
        { name: "Trash", component: <Trash /> },
        { name: "Trash2", component: <Trash2 /> },
        { name: "Download", component: <Download /> },
        { name: "Upload", component: <Upload /> },
        { name: "Copy", component: <Copy /> },
        { name: "Check", component: <Check /> },
        { name: "X", component: <X /> },
        { name: "Plus", component: <Plus /> },
        { name: "Search", component: <Search /> },
        { name: "ChevronDown", component: <ChevronDown /> },
        { name: "ChevronUp", component: <ChevronUp /> },
      ],
    },
    {
      name: "Authentication & Security",
      icons: [
        { name: "Shield", component: <Shield /> },
        { name: "ShieldAlert", component: <ShieldAlert /> },
        { name: "ShieldCheck", component: <ShieldCheck /> },
        { name: "KeyRound", component: <KeyRound /> },
        { name: "Eye", component: <Eye /> },
        { name: "EyeOff", component: <EyeOff /> },
      ],
    },
    {
      name: "Communication",
      icons: [
        { name: "Mail", component: <Mail /> },
        { name: "MailCheck", component: <MailCheck /> },
        { name: "MailWarning", component: <MailWarning /> },
        { name: "Twitter", component: <Twitter /> },
        { name: "Linkedin", component: <Linkedin /> },
        { name: "Facebook", component: <Facebook /> },
        { name: "Link", component: <Link /> },
      ],
    },
    {
      name: "User & Profile",
      icons: [
        { name: "UserPlus", component: <UserPlus /> },
        { name: "UserCircle", component: <UserCircle /> },
        { name: "Users", component: <Users /> },
        { name: "Camera", component: <Camera /> },
        { name: "Building", component: <Building /> },
        { name: "Globe", component: <Globe /> },
      ],
    },
    {
      name: "Devices & Payment",
      icons: [
        { name: "Smartphone", component: <Smartphone /> },
        { name: "CreditCard", component: <CreditCard /> },
        { name: "QrCode", component: <QrCode /> },
      ],
    },
    {
      name: "Miscellaneous",
      icons: [
        { name: "Calendar", component: <Calendar /> },
        { name: "Moon", component: <Moon /> },
        { name: "Sun", component: <Sun /> },
        { name: "Rocket", component: <Rocket /> },
        { name: "ArrowRight", component: <ArrowRight /> },
        { name: "Bell", component: <Bell /> },
        { name: "BadgePercent", component: <BadgePercent /> },
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lucide React Icons Test Page</h1>
      <p className="mb-4 text-gray-600">
        This page displays all lucide-react icons used in the application after upgrading
        from v0.488.0 to v0.510.0. Visual inspection should confirm that all icons render correctly.
      </p>
      
      <div className="grid gap-8">
        {iconGroups.map((group) => (
          <div key={group.name} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">{group.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {group.icons.map((icon) => (
                <div
                  key={icon.name}
                  className="flex flex-col items-center justify-center border rounded p-4 hover:bg-gray-50"
                >
                  <div className="h-8 w-8 flex items-center justify-center mb-2">
                    {icon.component}
                  </div>
                  <span className="text-sm text-gray-600">{icon.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 border rounded-lg bg-yellow-50">
        <h2 className="text-xl font-semibold mb-2">Notes on Updated Icons</h2>
        <p className="mb-2">
          The following icons have visual changes in v0.510.0:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Menu - Slightly more rounded corners</li>
          <li>Search - More consistent with design system</li>
          <li>Mail - Updated design</li>
          <li>Users - Refined visual appearance</li>
        </ul>
      </div>
    </div>
  );
} 