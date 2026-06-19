const Task = require('../models/Task');

// @desc    Get all tasks for logged-in user (with filters, search, sorting, pagination, & stats)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, search, sort, page = 1, limit = 6 } = req.query;
    
    // Build query object
    const query = { user_id: req.user._id };

    // Apply status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Apply search filter (match title or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination details
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object (default: newest first)
    let sortOption = { created_at: -1 };
    if (sort === 'oldest') {
      sortOption = { created_at: 1 };
    } else if (sort === 'alphabetical') {
      sortOption = { title: 1 };
    }

    // Fetch tasks for the current page
    const tasks = await Task.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total matching tasks count
    const totalMatchingTasks = await Task.countDocuments(query);

    // Calculate overall statistics for the current user (independent of search/filter/pagination)
    const allUserTasks = await Task.find({ user_id: req.user._id });
    
    const stats = {
      total: allUserTasks.length,
      pending: allUserTasks.filter(t => t.status === 'Pending').length,
      inProgress: allUserTasks.filter(t => t.status === 'In Progress').length,
      completed: allUserTasks.filter(t => t.status === 'Completed').length,
    };

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalMatchingTasks / limitNum),
        totalTasks: totalMatchingTasks,
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, status } = req.body;

  try {
    // Custom validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Task title is required' });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({ message: 'Task description is required' });
    }

    if (description.trim().length < 20) {
      return res.status(400).json({ message: 'Description must be at least 20 characters long' });
    }

    const task = new Task({
      user_id: req.user._id,
      title: title.trim(),
      description: description.trim(),
      status: status || 'Pending',
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Error creating task:', error.message);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

// @desc    Update a task status or details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const { title, description, status } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Update fields if provided
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) {
      if (description.trim().length < 20) {
        return res.status(400).json({ message: 'Description must be at least 20 characters' });
      }
      task.description = description.trim();
    }
    if (status !== undefined) {
      if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid task status' });
      }
      task.status = status;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error.message);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    console.error('Error deleting task:', error.message);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
