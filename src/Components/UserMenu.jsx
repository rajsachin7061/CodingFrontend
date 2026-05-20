/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { pageRoutes } from "../pageRoutes";

const getInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "U";

function UserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { label: "My Profile", page: "profile" },
    { label: "Edit Profile", page: "editProfile" },
    { label: "My Certificate", page: "certificate" },
    { label: "My Resume", page: "resume"},
  ];

  return (
    <div className="user-menu">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="profile-avatar-button"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {user.photo ? (
          <img alt={`${user.name} profile`} src={user.photo} />
        ) : (
          <span>{getInitial(user.name)}</span>
        )}
      </button>

      {isOpen && (
        <div className="profile-menu" role="menu">
          <div className="profile-menu-head">
            {user.photo ? (
              <img alt="" src={user.photo} />
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
              onClick={() => setIsOpen(false)}
              to={pageRoutes[item.page]}
              role="menuitem"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserMenu;
