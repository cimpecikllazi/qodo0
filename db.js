import { Sequelize, DataTypes } from 'sequelize';
import { DATABASE_PATH } from './config.js';

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DATABASE_PATH,
  logging: false // Set to console.log to see SQL queries
});

// Define User model
export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accessToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('inactive', 'active', 'past_due'),
    defaultValue: 'inactive'
  },
  currentPlan: {
    type: DataTypes.ENUM('starter', 'growth', 'pro'),
    defaultValue: 'starter'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  usageResetDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Define Location model
export const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  googleLocationId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Define Review model
export const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  locationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Location,
      key: 'id'
    }
  },
  googleReviewId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  reviewerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  replyStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'published'),
    defaultValue: 'pending'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Define associations
User.hasMany(Location, { foreignKey: 'userId' });
Location.belongsTo(User, { foreignKey: 'userId' });

Location.hasMany(Review, { foreignKey: 'locationId' });
Review.belongsTo(Location, { foreignKey: 'locationId' });

// Sync models with database
await sequelize.sync({ alter: true });

console.log('Database synchronized');

export default sequelize;