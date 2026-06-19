const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const connectDB = require('../config/db');
const authRoutes = require('../routes/authRoutes');
const taskRoutes = require('../routes/taskRoutes');
const User = require('../models/User');
const Task = require('../models/Task');

// Setup temporary app for tests
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Configure environment variable for tests
process.env.MONGO_URI = 'mongodb://localhost:27017/project_management_test';
process.env.JWT_SECRET = 'testjwtsecret12345';

describe('Mini Project Management Portal API Tests', () => {
  let token;
  let userId;
  let taskId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI);
    // Clear test database collections
    await User.deleteMany({});
    await Task.deleteMany({});
  });

  afterAll(async () => {
    // Drop test database and close connection
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Auth Endpoints', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Developer',
          email: 'testdev@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toBe('Test Developer');
      expect(res.body.email).toBe('testdev@example.com');
      
      userId = res.body.id;
    });

    it('should not register user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Developer 2',
          email: 'testdev@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User already exists with this email');
    });

    it('should login the registered user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testdev@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });

    it('should fail login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testdev@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Task Endpoints', () => {
    it('should not create a task without token', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task Title',
          description: 'This is a test description that meets the length constraint.',
        });

      expect(res.statusCode).toBe(401);
    });

    it('should not create a task with short description', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Short Desc Task',
          description: 'Too short',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Description must be at least 20 characters long');
    });

    it('should create a task successfully', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Build Login Form Component',
          description: 'Construct the login and sign up screens using CSS and React Router.',
          status: 'Pending',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Build Login Form Component');
      expect(res.body.status).toBe('Pending');
      taskId = res.body.id;
    });

    it('should fetch tasks and statistics for user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('tasks');
      expect(res.body).toHaveProperty('stats');
      expect(res.body.tasks.length).toBe(1);
      expect(res.body.stats.total).toBe(1);
      expect(res.body.stats.pending).toBe(1);
    });

    it('should update task status to Completed', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'Completed',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Completed');
    });

    it('should delete task successfully', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Task removed successfully');
    });
  });
});
