const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer toutes les tâches (avec filtrage par équipe)
const getAllTasks = async (req, res) => {
  try {
    const where = req.teamFilter
      ? { teamId: req.teamFilter }
      : {};

    const tasks = await prisma.task.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        meeting: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
  }
};

// Récupérer une tâche par ID (avec contrôle d'accès)
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        meeting: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    // Vérifier l'accès
    if (req.teamFilter && req.teamFilter !== task.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette tâche' });
    }

    res.json(task);
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la tâche' });
  }
};

// Créer une nouvelle tâche
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, teamId, assignedToId, meetingId } = req.body;
    const targetTeamId = parseInt(teamId);

    // Vérifier que l'utilisateur peut créer une tâche pour cette équipe
    if (req.teamFilter && req.teamFilter !== targetTeamId) {
      return res.status(403).json({ error: 'Vous ne pouvez créer des tâches que pour votre équipe' });
    }

    // Si une personne est assignée, vérifier qu'elle appartient à la même équipe
    if (assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: parseInt(assignedToId) }
      });

      if (!assignedUser || (req.teamFilter && assignedUser.teamId !== targetTeamId)) {
        return res.status(400).json({ error: 'L\'utilisateur assigné doit appartenir à la même équipe' });
      }
    }

    // Si une réunion est spécifiée, vérifier qu'elle appartient à la même équipe
    if (meetingId) {
      const meeting = await prisma.meeting.findUnique({
        where: { id: parseInt(meetingId) }
      });

      if (!meeting || (req.teamFilter && meeting.teamId !== targetTeamId)) {
        return res.status(400).json({ error: 'La réunion doit appartenir à la même équipe' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        teamId: targetTeamId,
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        meetingId: meetingId ? parseInt(meetingId) : null
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        meeting: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la tâche' });
  }
};

// Mettre à jour une tâche
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assignedToId, meetingId } = req.body;

    // Vérifier que la tâche existe et l'accès
    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    if (req.teamFilter && req.teamFilter !== existingTask.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette tâche' });
    }

    // Si une personne est assignée, vérifier qu'elle appartient à la même équipe
    if (assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: parseInt(assignedToId) }
      });

      if (!assignedUser || (req.teamFilter && assignedUser.teamId !== existingTask.teamId)) {
        return res.status(400).json({ error: 'L\'utilisateur assigné doit appartenir à la même équipe' });
      }
    }

    // Si une réunion est spécifiée, vérifier qu'elle appartient à la même équipe
    if (meetingId) {
      const meeting = await prisma.meeting.findUnique({
        where: { id: parseInt(meetingId) }
      });

      if (!meeting || (req.teamFilter && meeting.teamId !== existingTask.teamId)) {
        return res.status(400).json({ error: 'La réunion doit appartenir à la même équipe' });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId ? parseInt(assignedToId) : null;
    if (meetingId !== undefined) updateData.meetingId = meetingId ? parseInt(meetingId) : null;

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        meeting: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche' });
  }
};

// Supprimer une tâche
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la tâche existe et l'accès
    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    if (req.teamFilter && req.teamFilter !== existingTask.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette tâche' });
    }

    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
