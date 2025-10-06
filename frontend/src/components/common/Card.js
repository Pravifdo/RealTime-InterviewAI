import React from 'react';
import './Card.css';

const Card = ({ title, value, icon, className = '' }) => {
  return (
    <div className={`dashboard-card ${className}`}>
      {icon && <div className="card-icon">{icon}</div>}
      <h3 className="card-title">{title}</h3>
      <p className="card-value">{value}</p>
    </div>
  );
};

export default Card;
