const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer toutes les décisions (avec filtrage par équipe)
const getAllDecisions = async (req, res) => {
  try {
    const where = req.teamFilter
      ? { teamId: req.teamFilter }
      : {};

    const decisions = await prisma.decision.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true
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
        date: 'desc'
      }
    });

    res.json(decisions);
  } catch (error) {
    console.error('Erreur lors de la récupération des décisions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des décisions' });
  }
};

// Récupérer une décision par ID (avec contrôle d'accès)
const getDecisionById = async (req, res) => {
  try {
    const { id } = req.params;

    const decision = await prisma.decision.findUnique({
      where: { id: parseInt(id) },
      include: {
        team: {
          select: {
            id: true,
            name: true
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

    if (!decision) {
      return res.status(404).json({ error: 'Décision non trouvée' });
    }

    // Vérifier l'accès
    if (req.teamFilter && req.teamFilter !== decision.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette décision' });
    }

    res.json(decision);
  } catch (error) {
    console.error('Erreur lors de la récupération de la décision:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la décision' });
  }
};

// Créer une nouvelle décision
const createDecision = async (req, res) => {
  try {
    const { title, description, date, teamId, meetingId } = req.body;
    const targetTeamId = parseInt(teamId);

    // Vérifier que l'utilisateur peut créer une décision pour cette équipe
    if (req.teamFilter && req.teamFilter !== targetTeamId) {
      return res.status(403).json({ error: 'Vous ne pouvez créer des décisions que pour votre équipe' });
    }

    // Si une réunion est liée, vérifier qu'elle appartient à la même équipe
    if (meetingId) {
      const meeting = await prisma.meeting.findUnique({
        where: { id: parseInt(meetingId) }
      });

      if (!meeting || meeting.teamId !== targetTeamId) {
        return res.status(400).json({ error: 'La réunion doit appartenir à la même équipe' });
      }
    }

    const decision = await prisma.decision.create({
      data: {
        title,
        description,
        date: date ? new Date(date) : new Date(),
        teamId: targetTeamId,
        meetingId: meetingId ? parseInt(meetingId) : null
      },
      include: {
        team: {
          select: {
            id: true,
            name: true
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

    res.status(201).json(decision);
  } catch (error) {
    console.error('Erreur lors de la création de la décision:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la décision' });
  }
};

// Mettre à jour une décision
const updateDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;

    // Vérifier que la décision existe et l'accès
    const existingDecision = await prisma.decision.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingDecision) {
      return res.status(404).json({ error: 'Décision non trouvée' });
    }

    if (req.teamFilter && req.teamFilter !== existingDecision.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette décision' });
    }

    const decision = await prisma.decision.update({
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

    res.json(decision);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la décision:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la décision' });
  }
};

// Supprimer une décision
const deleteDecision = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la décision existe et l'accès
    const existingDecision = await prisma.decision.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingDecision) {
      return res.status(404).json({ error: 'Décision non trouvée' });
    }

    if (req.teamFilter && req.teamFilter !== existingDecision.teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette décision' });
    }

    await prisma.decision.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Décision supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la décision:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la décision' });
  }
};

module.exports = {
  getAllDecisions,
  getDecisionById,
  createDecision,
  updateDecision,
  deleteDecision
};
