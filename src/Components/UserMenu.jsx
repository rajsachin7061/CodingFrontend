/* eslint-disable react/prop-types */
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { pageRoutes } from "../pageRoutes";

const getInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "U";

function UserMenu({ onLogout, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef(null);
  const menuItems = [
    { label: "Code Compiler", page: "compiler" },
    { label: "My Profile", page: "profile" },
    { label: "Edit Profile", page: "editProfile" },
    { label: "My Certificate", page: "certificate" },
    { label: "My Resume", page: "resume" },
  ];

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen((current) => !current);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="profile-avatar-button"
        onClick={toggleMenu}
        type="button"
      >
        {user.photo ? (
          <img
            alt={`${user.name} profile`}
            src={user.photo}
          />
        ) : (
          <span>{getInitial(user.name)}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="profile-menu"
          id={menuId}
          role="menu"
        >
          <div className="profile-menu-head">
            {user.photo ? (
              <img
                alt=""
                src={user.photo}
              />
            ) : (
              <span>{getInitial(user.name)}</span>
            )}
            <div>
              <strong>{user.name}</strong>
              <small>@{user.username}</small>
            </div>
          </div>

          {menuItems.map((item) => (
            <Link
              className="menu-link-button"
              key={item.page}
              onClick={closeMenu}
              role="menuitem"
              to={pageRoutes[item.page]}
            >
              {item.label}
            </Link>
          ))}

          <button
            className="logout-menu-item"
            onClick={() => {
              closeMenu();
              onLogout?.();
            }}
            role="menuitem"
            type="button"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
