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
            name: true
          }
        },
        _count: {
          select: {
            decisions: true
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
            name: true
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
    const { title, description, date, teamId } = req.body;
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
        teamId: targetTeamId
      },
      include: {
        team: {
          select: {
            id: true,
            name: true
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
    const { title, description, date } = req.body;

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

    const meeting = await prisma.meeting.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined
      },
      include: {
        team: {
          select: {
            id: true,
            name: true
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

module.exports = {
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting
};
