import React from 'react';
import './Sidebar.css';

const Sidebar = ({ title, menuItems, activePage, onMenuClick, onLogout }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">{title}</h2>
      
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`sidebar-btn ${activePage === item.id ? 'active' : ''}`}
          onClick={() => onMenuClick(item.id)}
        >
          {item.icon} {item.label}
        </button>
      ))}

      {onLogout && (
        <>
          <hr />
          <button className="sidebar-btn logout-btn" onClick={onLogout}>
            🚪 Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Sidebar;
