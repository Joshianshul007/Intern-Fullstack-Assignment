import { Request, Response } from 'express';
import Task from '../models/Task';

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const tasks = await Task.find({ user: (req as any).user._id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            res.status(400).json({ message: 'Title and description are required' });
            return;
        }

        const task = new Task({
            user: (req as any).user._id,
            title,
            description,
        });

        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, isCompleted } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        if (task.user.toString() !== (req as any).user._id.toString()) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        task.title = title || task.title;
        task.description = description || task.description;

        // Explicitly check for boolean value since it could be false
        if (isCompleted !== undefined) {
            task.isCompleted = isCompleted;
        }

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        if (task.user.toString() !== (req as any).user._id.toString()) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        await Task.deleteOne({ _id: task._id });
        res.json({ message: 'Task removed' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};
