const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  // Créer des équipes
  const equipe1 = await prisma.team.create({
    data: {
      name: 'Équipe Développement',
      description: 'Équipe en charge du développement logiciel'
    }
  });

  const equipe2 = await prisma.team.create({
    data: {
      name: 'Équipe Marketing',
      description: 'Équipe en charge du marketing et communication'
    }
  });

  console.log('Équipes créées');

  // Créer des utilisateurs
  const hashedPassword = await bcrypt.hash('password123', 10);

  const direction = await prisma.user.create({
    data: {
      email: 'direction@example.com',
      password: hashedPassword,
      firstName: 'Marie',
      lastName: 'Directrice',
      role: 'DIRECTION',
      teamId: null
    }
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Dupont',
      role: 'MEMBRE',
      teamId: equipe1.id
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Martin',
      role: 'MEMBRE',
      teamId: equipe1.id
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      password: hashedPassword,
      firstName: 'Charlie',
      lastName: 'Durand',
      role: 'MEMBRE',
      teamId: equipe2.id
    }
  });

  console.log('Utilisateurs créés');

  // Créer des réunions
  const meeting1 = await prisma.meeting.create({
    data: {
      title: 'Réunion de sprint planning',
      description: 'Planification du prochain sprint',
      date: new Date('2024-11-15T10:00:00'),
      teamId: equipe1.id
    }
  });

  const meeting2 = await prisma.meeting.create({
    data: {
      title: 'Revue marketing mensuelle',
      description: 'Revue des campagnes du mois',
      date: new Date('2024-11-20T14:00:00'),
      teamId: equipe2.id
    }
  });

  console.log('Réunions créées');

  // Créer des tâches
  await prisma.task.create({
    data: {
      title: 'Développer la page de connexion',
      description: 'Créer une interface de connexion responsive',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2024-11-10'),
      teamId: equipe1.id,
      assignedToId: user1.id
    }
  });

  await prisma.task.create({
    data: {
      title: 'Corriger les bugs du module utilisateurs',
      description: 'Résoudre les problèmes signalés',
      status: 'TODO',
      priority: 'URGENT',
      dueDate: new Date('2024-11-08'),
      teamId: equipe1.id,
      assignedToId: user2.id
    }
  });

  await prisma.task.create({
    data: {
      title: 'Préparer la campagne publicitaire',
      description: 'Créer les visuels et textes pour la prochaine campagne',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date('2024-11-25'),
      teamId: equipe2.id,
      assignedToId: user3.id
    }
  });

  console.log('Tâches créées');

  // Créer des décisions
  await prisma.decision.create({
    data: {
      title: 'Adoption de React pour le frontend',
      description: 'Décision d\'utiliser React comme framework frontend principal',
      date: new Date('2024-10-15'),
      teamId: equipe1.id,
      meetingId: meeting1.id
    }
  });

  await prisma.decision.create({
    data: {
      title: 'Budget campagne Q4',
      description: 'Validation du budget de 50 000€ pour la campagne du Q4',
      date: new Date('2024-10-20'),
      teamId: equipe2.id,
      meetingId: meeting2.id
    }
  });

  console.log('Décisions créées');

  console.log('Seeding terminé avec succès !');
  console.log('\nComptes de test:');
  console.log('Direction: direction@example.com / password123');
  console.log('Équipe Dev - Alice: alice@example.com / password123');
  console.log('Équipe Dev - Bob: bob@example.com / password123');
  console.log('Équipe Marketing - Charlie: charlie@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
