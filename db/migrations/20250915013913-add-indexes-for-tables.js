'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('users', ['status']);
    await queryInterface.addIndex('users', ['created_at']);
    await queryInterface.addIndex('companies', ['created_at']);
    await queryInterface.addIndex('tickets', ['created_at']);
    await queryInterface.addIndex('tickets', ['company_id']);
    await queryInterface.addIndex('tickets', ['assignee_id']);
    await queryInterface.addIndex('tickets', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', ['status']);
    await queryInterface.removeIndex('users', ['created_at']);
    await queryInterface.removeIndex('companies', ['created_at']);
    await queryInterface.removeIndex('tickets', ['created_at']);
    await queryInterface.removeIndex('tickets', ['company_id']);
    await queryInterface.removeIndex('tickets', ['assignee_id']);
    await queryInterface.removeIndex('tickets', ['status']);
  },
};
