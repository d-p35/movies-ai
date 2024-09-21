"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import config from "@/config/config.json";
import { getActiveLanguages } from "@/lib/languageParser";
import { slugSelector } from "@/lib/utils/slugSelector";
import { INavigationLink } from "@/types";
import { SignIn, SignInButton, SignOutButton, SignUpButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {useRouter} from "next/navigation";
import React, { useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { UserProfile } from '@clerk/nextjs'

const UserProfilePage = () => <UserProfile path="/user-profile" />

const Header = ({
  lang,
  menu,
}: {
  lang: string;
  menu: { main: INavigationLink[] };
}) => {
  const activeLanguages = getActiveLanguages();
  const { main }: { main: INavigationLink[] } = menu;
  const { navigation_button, settings } = config;
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();
  console.log(pathname);


  if (user && pathname !== "/dashboard") {
    router.push("/dashboard");
  }

  console.log(user);

  // scroll to top on route change
  useEffect(() => {
    window.scroll(0, 0);
  }, [pathname]);

  return (
    <header
      className={`header z-30 ${settings.sticky_header && "sticky top-0"}`}
    >
      <nav className="navbar container">
        {/* logo */}
        <div className="order-0">
          <Logo lang={lang} />
        </div>
        {/* navbar toggler */}
        <input id="nav-toggle" type="checkbox" className="hidden" />
        <label
          htmlFor="nav-toggle"
          className="order-3 cursor-pointer flex items-center lg:hidden text-dark dark:text-white lg:order-1"
        >
          <svg
            id="show-button"
            className="h-6 fill-current block"
            viewBox="0 0 20 20"
          >
            <title>Menu Open</title>
            <path d="M0 3h20v2H0V3z m0 6h20v2H0V9z m0 6h20v2H0V0z"></path>
          </svg>
          <svg
            id="hide-button"
            className="h-6 fill-current hidden"
            viewBox="0 0 20 20"
          >
            <title>Menu Close</title>
            <polygon
              points="11 9 22 9 22 11 11 11 11 22 9 22 9 11 -2 11 -2 9 9 9 9 -2 11 -2"
              transform="rotate(45 10 10)"
            ></polygon>
          </svg>
        </label>
        {/* /navbar toggler */}

        <ul
          id="nav-menu"
          className="navbar-nav order-3 hidden w-full pb-6 lg:order-1 lg:flex lg:w-auto lg:space-x-2 lg:pb-0 xl:space-x-8"
        >
         
           
        
          {/* {navigation_button.enable && (
            <li className="mt-4 inline-block lg:hidden">
              <Link
                className="btn btn-outline-primary btn-sm"
                href={navigation_button.link}
              >
                Pages
              </Link>
            </li>
          )} */}
        </ul>
        <div className="order-1 ml-auto flex items-center md:order-2 lg:ml-0">
          {settings.search && (
            <button
              className="border-border text-dark hover:text-primary dark:border-darkmode-border mr-5 inline-block border-r pr-5 text-xl dark:text-white dark:hover:text-darkmode-primary"
              aria-label="search"
              data-search-trigger
            >
              <IoSearch />
            </button>
          )}
          <ThemeSwitcher className="mr-5" />

          {activeLanguages.length > 1 && (
            <LanguageSwitcher
              lang={lang}
              className="mr-5 pl-2 py-1 dark:bg-darkmode-theme-light rounded"
            />
          )}

          {!user ? (
          <SignUpButton>
            <button
            className="btn btn-outline-primary btn-sm hidden lg:inline-block"
            >
             Get Started
            </button>
          </SignUpButton>
          ) : (
            <>
            {/* <UserProfilePage /> */}
          <SignOutButton>
            <button
            className="btn btn-outline-primary btn-sm hidden lg:inline-block"
            >
             Sign Out
            </button>
          </SignOutButton>
          </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
