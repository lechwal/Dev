const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer toutes les réunions (avec filtrage par équipe)
const getAllMeetings = async (req, res) => {
  try {
    const where = req.teamFilter
      ? { teamId: req.teamFilter }
      : {};

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        _count: {
          select: {
            decisions: true,
            tasks: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(meetings);
  } catch (error) {
    console.error('Erreur lors de la récupération des réunions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réunions' });
  }
};

// Récupérer une réunion par ID (avec contrôle d'accès)
const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id: parseInt(id) },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        decisions: true
      }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Réunion non trouvée' });
    }

    // Vérifier l'accès
    if (req.teamFilter && req.teamFilter !== meeting.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette réunion' });
    }

    res.json(meeting);
  } catch (error) {
    console.error('Erreur lors de la récupération de la réunion:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la réunion' });
  }
};

// Créer une nouvelle réunion
const createMeeting = async (req, res) => {
  try {
    const { title, description, date, teamId, notes } = req.body;
    const targetTeamId = parseInt(teamId);

    // Vérifier que l'utilisateur peut créer une réunion pour cette équipe
    if (req.teamFilter && req.teamFilter !== targetTeamId) {
      return res.status(403).json({ error: 'Vous ne pouvez créer des réunions que pour votre équipe' });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        date: new Date(date),
        notes: notes || null,
        teamId: targetTeamId
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error('Erreur lors de la création de la réunion:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la réunion' });
  }
};

// Mettre à jour une réunion
const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, notes } = req.body;

    // Vérifier que la réunion existe et l'accès
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingMeeting) {
      return res.status(404).json({ error: 'Réunion non trouvée' });
    }

    if (req.teamFilter && req.teamFilter !== existingMeeting.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette réunion' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;

    const meeting = await prisma.meeting.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    res.json(meeting);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réunion:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la réunion' });
  }
};

// Supprimer une réunion
const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la réunion existe et l'accès
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingMeeting) {
      return res.status(404).json({ error: 'Réunion non trouvée' });
    }

    if (req.teamFilter && req.teamFilter !== existingMeeting.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette réunion' });
    }

    await prisma.meeting.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Réunion supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réunion:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la réunion' });
  }
};

// Ajouter un participant à une réunion
const addParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Vérifier que la réunion existe et l'accès
    const meeting = await prisma.meeting.findUnique({
      where: { id: parseInt(id) }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Réunion non trouvée' });
    }

    if (req.teamFilter && req.teamFilter !== meeting.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette réunion' });
    }

    // Vérifier que l'utilisateur existe et fait partie de la même équipe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (req.teamFilter && user.teamId !== meeting.teamId) {
      return res.status(403).json({ error: 'Utilisateur non membre de cette équipe' });
    }

    // Ajouter le participant
    const participant = await prisma.meetingParticipant.create({
      data: {
        meetingId: parseInt(id),
        userId: parseInt(userId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(participant);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Participant déjà ajouté à cette réunion' });
    }
    console.error('Erreur lors de l\'ajout du participant:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du participant' });
  }
};

// Retirer un participant d'une réunion
const removeParticipant = async (req, res) => {
  try {
    const { id, participantId } = req.params;

    // Vérifier que la réunion existe et l'accès
    const meeting = await prisma.meeting.findUnique({
      where: { id: parseInt(id) }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Réunion non trouvée' });
    }

    if (req.teamFilter && req.teamFilter !== meeting.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette réunion' });
    }

    await prisma.meetingParticipant.delete({
      where: { id: parseInt(participantId) }
    });

    res.json({ message: 'Participant retiré avec succès' });
  } catch (error) {
    console.error('Erreur lors du retrait du participant:', error);
    res.status(500).json({ error: 'Erreur lors du retrait du participant' });
  }
};

// Ajouter un point à l'ordre du jour
const addAgendaItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    // Vérifier que la réunion existe et l'accès
    const meeting = await prisma.meeting.findUnique({
      where: { id: parseInt(id) }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Réunion non trouvée' });
    }

    if (req.teamFilter && req.teamFilter !== meeting.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette réunion' });
    }

    // Si pas d'ordre spécifié, mettre à la fin
    let itemOrder = order;
    if (itemOrder === undefined) {
      const lastItem = await prisma.agendaItem.findFirst({
        where: { meetingId: parseInt(id) },
        orderBy: { order: 'desc' }
      });
      itemOrder = lastItem ? lastItem.order + 1 : 0;
    }

    const agendaItem = await prisma.agendaItem.create({
      data: {
        meetingId: parseInt(id),
        title,
        description: description || null,
        order: itemOrder
      }
    });

    res.status(201).json(agendaItem);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du point à l\'ordre du jour:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du point à l\'ordre du jour' });
  }
};

// Mettre à jour un point de l'ordre du jour
const updateAgendaItem = async (req, res) => {
  try {
    const { id, agendaId } = req.params;
    const { title, description, order, completed } = req.body;

    // Vérifier que la réunion existe et l'accès
    const agendaItem = await prisma.agendaItem.findUnique({
      where: { id: parseInt(agendaId) },
      include: { meeting: true }
    });

    if (!agendaItem) {
      return res.status(404).json({ error: 'Point de l\'ordre du jour non trouvé' });
    }

    if (req.teamFilter && req.teamFilter !== agendaItem.meeting.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (completed !== undefined) updateData.completed = completed;

    const updated = await prisma.agendaItem.update({
      where: { id: parseInt(agendaId) },
      data: updateData
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du point à l\'ordre du jour:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du point à l\'ordre du jour' });
  }
};

// Supprimer un point de l'ordre du jour
const deleteAgendaItem = async (req, res) => {
  try {
    const { id, agendaId } = req.params;

    // Vérifier que la réunion existe et l'accès
    const agendaItem = await prisma.agendaItem.findUnique({
      where: { id: parseInt(agendaId) },
      include: { meeting: true }
    });

    if (!agendaItem) {
      return res.status(404).json({ error: 'Point de l\'ordre du jour non trouvé' });
    }

    if (req.teamFilter && req.teamFilter !== agendaItem.meeting.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await prisma.agendaItem.delete({
      where: { id: parseInt(agendaId) }
    });

    res.json({ message: 'Point de l\'ordre du jour supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du point à l\'ordre du jour:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du point à l\'ordre du jour' });
  }
};

module.exports = {
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  addParticipant,
  removeParticipant,
  addAgendaItem,
  updateAgendaItem,
  deleteAgendaItem
};
