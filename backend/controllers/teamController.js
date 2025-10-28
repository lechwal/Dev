const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer toutes les équipes (avec filtrage)
const getAllTeams = async (req, res) => {
  try {
    // Si l'utilisateur est de la direction, il voit tout
    // Sinon, il ne voit que son équipe
    const where = req.teamFilter
      ? { id: req.teamFilter }
      : {};

    const teams = await prisma.team.findMany({
      where,
      include: {
        _count: {
          select: {
            members: true,
            meetings: true,
            tasks: true,
            decisions: true
          }
        }
      }
    });

    res.json(teams);
  } catch (error) {
    console.error('Erreur lors de la récupération des équipes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des équipes' });
  }
};

// Récupérer une équipe par ID (avec contrôle d'accès)
const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const teamId = parseInt(id);

    // Vérifier l'accès
    if (req.teamFilter && req.teamFilter !== teamId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette équipe' });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        _count: {
          select: {
            meetings: true,
            tasks: true,
            decisions: true
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Équipe non trouvée' });
    }

    res.json(team);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'équipe:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'équipe' });
  }
};

// Créer une nouvelle équipe (réservé à la direction)
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await prisma.team.create({
      data: {
        name,
        description
      }
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Erreur lors de la création de l\'équipe:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Une équipe avec ce nom existe déjà' });
    }

    res.status(500).json({ error: 'Erreur lors de la création de l\'équipe' });
  }
};

// Mettre à jour une équipe (réservé à la direction)
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const team = await prisma.team.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description
      }
    });

    res.json(team);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'équipe:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Équipe non trouvée' });
    }

    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'équipe' });
  }
};

// Supprimer une équipe (réservé à la direction)
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.team.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'équipe:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Équipe non trouvée' });
    }

    res.status(500).json({ error: 'Erreur lors de la suppression de l\'équipe' });
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
};
