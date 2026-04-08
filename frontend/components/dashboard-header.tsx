"use client"

import { useEffect, useRef, useState } from "react";
import { FiPlus, FiLogOut, FiUser } from "react-icons/fi";
import MaxWidthWrapper from "./MaxWidthWrapper";
import BrandLogo from "./brand-logo";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DashboardHeaderProps {
  statusFilter: "all" | "pending" | "completed";
  setStatusFilter: (filter: "all" | "pending" | "completed") => void;
  handleLogout: () => void;
  handleOpenModal: () => void;
  userName?: string;
  userEmail?: string;
}

export function DashboardHeader({
  statusFilter,
  setStatusFilter,
  handleLogout,
  handleOpenModal,
  userName = "User",
  userEmail = "",
}: DashboardHeaderProps) {
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="py-4 bg-[rgba(255,255,255,0.92)] backdrop-blur-xl border-b border-[#dbe3e7] sticky top-0 z-30 flex items-center">
      <MaxWidthWrapper className="flex flex-col gap-4">
        {/* Top Row: Logo & Actions */}
        <div className="flex items-center justify-between w-full">

          <div className="hidden md:flex">
            <BrandLogo />
          </div>
          <div className="md:hidden">
            <BrandLogo compact />
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Desktop View: Full Info & Inline Logout */}
            <div className="hidden sm:flex items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-3 pr-3 sm:pr-5 border-r border-[#dbe3e7]">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-on-surface leading-tight">
                    {userName}
                  </span>
                  <span className="text-[11px] font-medium text-on-surface-variant/80 truncate max-w-[120px] sm:max-w-none">
                    {userEmail}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden shrink-0">
                  {initials}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2.5 text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-full cursor-pointer hover:bg-[#fee2e2] transition-all active:scale-90 shadow-sm flex items-center justify-center"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile View: Avatar button with Popover */}
            <div className="sm:hidden flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden shrink-0 cursor-pointer active:scale-95 transition-transform border-none outline-none">
                    {initials}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-32px)] max-w-[280px] p-2 z-50 rounded-2xl shadow-xl border border-[#dbe3e7] mt-2 bg-white" align="end" sideOffset={8}>
                  {/* User Details Box */}
                  <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-[#dbe3e7]">
                    {/* <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shrink-0">
                      {initials}
                    </div> */}
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-sm font-bold text-on-surface truncate">{userName}</span>
                      <span className="text-[11px] font-medium text-on-surface-variant truncate">{userEmail}</span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-4 text-sm font-bold text-[#b91c1c] bg-[#fef2f2c0] rounded-xl transition-colors cursor-pointer border-none"
                  >
                    <FiLogOut className="w-[18px] h-[18px]" />
                    Logout
                  </button>
                </PopoverContent>
              </Popover>
            </div>

          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
}
