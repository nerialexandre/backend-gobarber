// campo de avatar_id para tabela de usuários relacionado com a coluna id da tabela files
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('users', 'avatar_id', {
      type: Sequelize.INTEGER,
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: queryInterface => queryInterface.removeColumn('uses', 'avatar_id'),
};
